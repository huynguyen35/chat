package com.hine.chat_be.jwt;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;
import java.util.Optional;

public class CookieUtils {

    // Thêm cookie
    public static void addCookie(HttpServletResponse response, String name, String value, int maxAgeInSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true); // Không cho JS truy cập để tăng bảo mật
        cookie.setMaxAge(maxAgeInSeconds);
        response.addCookie(cookie);
    }

    // Lấy cookie theo tên
    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .findFirst();
    }

    // Xóa cookie
    public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Optional<Cookie> cookieOpt = getCookie(request, name);

        if (cookieOpt.isPresent()) {
            Cookie cookie = cookieOpt.get();
            cookie.setValue("");
            cookie.setPath("/");
            cookie.setMaxAge(0); // Gán tuổi = 0 để xóa
            response.addCookie(cookie);
        }
    }
}

