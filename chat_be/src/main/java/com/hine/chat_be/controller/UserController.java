package com.hine.chat_be.controller;

import com.hine.chat_be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // get information user
    @GetMapping("/info/{id}")
    public ResponseEntity<?> getUserInfo(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserInfo(id));
    }
}
