package com.hine.chat_be.service;

import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
    ResponseEntity<?> register(RegisterRequest registerRequest);

    ResponseEntity<?> login(LoginRequest loginRequest);

    ResponseEntity<?> logout();

    Object getUserInfo(Integer id);
}
