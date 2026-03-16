package com.hine.chat_be.service;

import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.RegisterRequest;
import com.hine.chat_be.payload.UserInfo;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    ResponseEntity<?> register(RegisterRequest registerRequest);

    ResponseEntity<?> login(LoginRequest loginRequest, HttpServletResponse response);

    ResponseEntity<?> refreshToken(String token, HttpServletResponse response);

    ResponseEntity<?> logout();

    Object getUserInfo(Long id);

    Object updateUserImage(Long id, String avt);

    List<UserInfo> searchUsers(String query, Long excludeUserId);
}
