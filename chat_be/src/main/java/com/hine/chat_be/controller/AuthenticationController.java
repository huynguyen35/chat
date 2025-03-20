package com.hine.chat_be.controller;

import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.RegisterRequest;
import com.hine.chat_be.service.UserService;
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
    public ResponseEntity register(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(userService.register(registerRequest));
    }

    // login user
    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.login(loginRequest));
    }

    // logout user
    @GetMapping("/logout")
    public ResponseEntity logout() {
        return ResponseEntity.ok(userService.logout());
    }
}
