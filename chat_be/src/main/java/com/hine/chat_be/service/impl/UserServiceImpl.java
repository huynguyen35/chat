package com.hine.chat_be.service.impl;

import com.hine.chat_be.entity.User;
import com.hine.chat_be.jwt.JwtUtil;
import com.hine.chat_be.payload.LoginRequest;
import com.hine.chat_be.payload.RegisterRequest;
import com.hine.chat_be.payload.UserInfo;
import com.hine.chat_be.repository.UserRepository;
import com.hine.chat_be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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
            return ResponseEntity.badRequest().body("User already exists");
        }

        // create new user
        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @Override
    public ResponseEntity<?> login(LoginRequest loginRequest) {
        // check if user exists
        if (!userRepository.existsByEmail(loginRequest.getEmail())) {
            return ResponseEntity.badRequest().body("User does not exist");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail());
        if(user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            String jwt = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.ok("Bearer " + jwt);
        } else {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

    }

    @Override
    public ResponseEntity<?> logout() {

        return ResponseEntity.ok("User logged out successfully");

    }

    @Override
    public Object getUserInfo(Integer id) {
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
}
