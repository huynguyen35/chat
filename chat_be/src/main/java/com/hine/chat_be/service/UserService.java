package com.hine.chat_be.service;

import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
    ResponseEntity<?> register(RegisterRequest registerRequest);

    ResponseEntity<?> login(LoginRequest loginRequest, HttpServletResponse response);

    ResponseEntity<?> refreshToken(String token);

    ResponseEntity<?> logout();

    Object getUserInfo(Long id);

    Object updateUserImage(Long id, String avt);
}
