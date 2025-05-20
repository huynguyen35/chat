package com.hine.chat_be.payload;

import com.hine.chat_be.entity.Notification;
import com.hine.chat_be.entity.User;
import com.hine.chat_be.entity.enums.NotificationType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;

    private UserInfo receiver;

    private UserInfo sender;

    private NotificationType notificationType;

    private Long referenceId;

    private String content;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public NotificationDTO() {
    }

    public NotificationDTO(Long id, UserInfo receiver, UserInfo sender, NotificationType notificationType, Long referenceId, String content, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.receiver = receiver;
        this.sender = sender;
        this.notificationType = notificationType;
        this.referenceId = referenceId;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserInfo getReceiver() {
        return receiver;
    }

    public void setReceiver(UserInfo receiver) {
        this.receiver = receiver;
    }

    public UserInfo getSender() {
        return sender;
    }

    public void setSender(UserInfo sender) {
        this.sender = sender;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public NotificationDTO toDTO(Notification notification) {
        this.id = notification.getId();
        this.receiver = new UserInfo().toUserDTO(notification.getReceiver());
        this.sender = new UserInfo().toUserDTO(notification.getSender());
        this.notificationType = notification.getNotificationType();
        this.referenceId = notification.getReferenceId();
        this.content = notification.getContent();
        this.isRead = notification.isRead();
        this.createdAt = notification.getCreatedAt();
        return this;
    }
}
