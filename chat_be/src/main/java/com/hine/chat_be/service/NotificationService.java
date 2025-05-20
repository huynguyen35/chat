package com.hine.chat_be.service;

import com.hine.chat_be.entity.Notification;
import com.hine.chat_be.payload.NotificationDTO;

import java.util.List;

public interface NotificationService {
    void senNotificationToUser(Long userId, NotificationDTO notificationDTO);

    List<NotificationDTO> getAllNotificationByUserId(Long userId);


}
