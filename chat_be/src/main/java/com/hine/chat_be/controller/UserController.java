package com.hine.chat_be.controller;

import com.hine.chat_be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // get information user
    @GetMapping("/info/{id}")
    public ResponseEntity<?> getUserInfo(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserInfo(id));
    }

    // update image user
    @PutMapping("/update-image/{id}")
    public ResponseEntity<?> updateUserImage(@PathVariable Long id, @RequestParam String avt) {
        return ResponseEntity.ok(userService.updateUserImage(id, avt));
    }
}
