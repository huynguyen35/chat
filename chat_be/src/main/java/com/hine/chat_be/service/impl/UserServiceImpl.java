package com.hine.chat_be.service.impl;

import com.hine.chat_be.entity.User;
import com.hine.chat_be.jwt.JwtUtil;
import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.LoginResponse;
import com.hine.chat_be.payload.RegisterRequest;
import com.hine.chat_be.payload.UserInfo;
import com.hine.chat_be.repository.UserRepository;
import com.hine.chat_be.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public ResponseEntity<?> register(RegisterRequest registerRequest) {
        // check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email đã được sử dụng");
        }

        // create new user
        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công");
    }

    @Override
    public ResponseEntity<?> login(LoginRequest loginRequest, HttpServletResponse response) {
        // check if user exists
        if (!userRepository.existsByEmail(loginRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email chưa đăng ký tài khoản");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail());
        if(user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getId());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getId());

            // set token to response
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setId(user.getId());
            loginResponse.setEmail(user.getEmail());
            loginResponse.setFirstName(user.getFirstName());
            loginResponse.setLastName(user.getLastName());
            loginResponse.setAvt(user.getAvt());

            // set access token to cookie
            Cookie cookie = new Cookie("jwt", jwt);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60); // 1 hour
            cookie.setSecure(false); // Chỉ gửi cookie qua HTTPS
            response.addCookie(cookie);

            // set refresh token to cookie
            Cookie cookieRefresh = new Cookie("refreshToken", refreshToken);
            cookieRefresh.setHttpOnly(true);
            cookieRefresh.setPath("/");
            cookieRefresh.setMaxAge(60 * 60 * 24 * 7); // 7 days
            cookieRefresh.setSecure(false); // Chỉ gửi cookie qua HTTPS
            response.addCookie(cookieRefresh);


            return ResponseEntity.ok(loginResponse);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai mật khẩu");
        }
    }

    @Override
    public ResponseEntity<?> refreshToken(String token) {
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid refresh token");
        }

        String username = jwtUtil.extractUsername(token);
        Long userId = jwtUtil.extractUserId(token);
        String newAccessToken = jwtUtil.generateToken(username, userId);

        // set new access token to cookie
        Cookie cookie = new Cookie("jwt", newAccessToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60); // 1 hour
        cookie.setSecure(false); // Chỉ gửi cookie qua HTTPS
        HttpServletResponse response = null; // You need to pass the response object here
        response.addCookie(cookie);


        return ResponseEntity.ok("ok");
    }

    @Override
    public ResponseEntity<?> logout() {

        return ResponseEntity.ok("User logged out successfully");

    }

    @Override
    public Object getUserInfo(Long id) {
        UserInfo userInfo = new UserInfo();
        User user = userRepository.findById(id).orElse(null);
        if(user != null) {
            userInfo.setId(user.getId());
            userInfo.setFirstName(user.getFirstName());
            userInfo.setLastName(user.getLastName());
            userInfo.setEmail(user.getEmail());
        }
        return userInfo;
    }

    @Override
    public Object updateUserImage(Long id, String avt) {
        User user = userRepository.findById(id).orElse(null);
        if(user != null) {
            user.setAvt(avt);
            userRepository.save(user);
            return new UserInfo().toUserDTO(user);
        }
        return null;
    }
}
