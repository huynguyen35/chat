package com.hine.chat_be.controller;

import com.hine.chat_be.payload.NotificationDTO;
import com.hine.chat_be.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public List<NotificationDTO> getAllNotificationByUserId(@PathVariable Long userId) {
        return notificationService.getAllNotificationByUserId(userId);
    }
}
