package com.hine.chat_be.controller;

import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.RegisterRequest;
import com.hine.chat_be.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private UserService userService;

    //test
    @GetMapping("/test")
    public String test() {
        return "test";
    }

    // register user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        return userService.register(registerRequest);
    }

    // login user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        return userService.login(loginRequest, response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String token,
                                          HttpServletResponse response) {
        return userService.refreshToken(token, response);
    }

    // logout user
    @GetMapping("/logout")
    public ResponseEntity<?> logout() {
        return userService.logout();
    }
}
