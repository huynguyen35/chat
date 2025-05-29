package com.hine.chat_be.service.impl;

import com.hine.chat_be.entity.Notification;
import com.hine.chat_be.payload.NotificationDTO;
import com.hine.chat_be.payload.UserInfo;
import com.hine.chat_be.repository.NotificationRepository;
import com.hine.chat_be.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void senNotificationToUser(Long userId, NotificationDTO notificationDTO) {
         System.out.println("Sending notification to user: " + userId);
        messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notification", notificationDTO);

    }

    @Override
    public List<NotificationDTO> getAllNotificationByUserId(Long userId) {
        // Fetch all notifications for the user from the database
        List<Notification> notifications = notificationRepository.findByReceiver_Id(userId);

        // Convert the list of Notification entities to NotificationDTOs
        return notifications.stream()
                .map(notification -> new NotificationDTO(
                        notification.getId(),
                        new UserInfo().toUserDTO(notification.getReceiver()),
                        new UserInfo().toUserDTO(notification.getSender()),
                        notification.getNotificationType(),
                        notification.getReferenceId(),
                        notification.getContent(),
                        notification.isRead(),
                        notification.getCreatedAt()
                ))
                .collect(Collectors.toList());

    }
}
