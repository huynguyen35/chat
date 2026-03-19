package com.hine.chat_be.jwt;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final UserDetailsService userDetailsService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    public JwtRequestFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Optional<Cookie> jwtCookie = CookieUtils.getCookie(request, "jwt");
        Optional<Cookie> refreshTokenCookie = CookieUtils.getCookie(request, "refreshToken");

        String jwt = jwtCookie.map(Cookie::getValue).orElse(null);
        String refreshToken = refreshTokenCookie.map(Cookie::getValue).orElse(null);
        String username = null;

        try {
            if (jwt != null) {
                username = jwtUtil.extractUsername(jwt);
            }
        } catch (Exception e) {
            // Token có thể đã hết hạn
        }

        // Nếu có username và chưa authenticate
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                // Access token hợp lệ
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Trường hợp jwt hết hạn nhưng có refreshToken
        else if (refreshToken != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                String refreshUsername = jwtUtil.extractUsername(refreshToken);
                Long refreshUserId = jwtUtil.extractUserId(refreshToken);

                if (jwtUtil.validateToken(refreshToken, refreshUsername)) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(refreshUsername);

                    // Sinh access token mới
                    String newJwt = jwtUtil.generateToken(refreshUsername, refreshUserId);

                    // Set lại cookie jwt
                    ResponseCookie newAccessTokenCookie = ResponseCookie.from("jwt", newJwt)
                            .httpOnly(true)
                            .secure(cookieSecure)
                            .path("/")
                            .sameSite(cookieSameSite)
                            .maxAge(60 * 60)
                            .build();
                    response.addHeader(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString());

                    // Set authentication vào context
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                // refresh token hết hạn hoặc lỗi
                System.out.println("Refresh token invalid: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}

