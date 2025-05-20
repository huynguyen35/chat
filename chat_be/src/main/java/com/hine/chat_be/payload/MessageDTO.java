package com.hine.chat_be.payload;

import com.hine.chat_be.entity.Conversation;
import com.hine.chat_be.entity.Message;

import java.util.List;

public class MessageDTO {
    private Long id;
    private Long conversationId;
    private UserInfo sender;
    private String content;
    private String type;
    private String sentAt;
    private boolean isRead;
    private boolean isDeleted;
    private boolean isRecalled;

    public MessageDTO(Long id, Long conversationId, UserInfo sender, String content, String type, String sentAt, boolean isRead, boolean isDeleted, boolean isRecalled) {
        this.id = id;
        this.conversationId = conversationId;
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.sentAt = sentAt;
        this.isRead = isRead;
        this.isDeleted = isDeleted;
        this.isRecalled = isRecalled;
    }

    public MessageDTO() {
    }

    public MessageDTO toDTO(Message message) {
        return new MessageDTO(message.getId(), message.getConversation().getId(), new UserInfo().toUserDTO(message.getSender()), message.getContent(), message.getMessageType().toString(), message.getSentAt().toString(), message.isRead(), message.isDeleted(), message.isRecalled());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversation() {
        return conversationId;
    }


    public void setConversation(Long conversationId) {
        this.conversationId = conversationId;
    }

    public UserInfo getSender() {
        return sender;
    }

    public void setSender(UserInfo senderId) {
        this.sender = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public String getSentAt() {
        return sentAt;
    }

    public void setSentAt(String sentAt) {
        this.sentAt = sentAt;
    }

    public boolean isRead() {
        return isRead;
    }
    public void setRead(boolean read) {
        isRead = read;
    }
    public boolean isDeleted() {
        return isDeleted;
    }
    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }
    public boolean isRecalled() {
        return isRecalled;
    }
    public void setRecalled(boolean recalled) {
        isRecalled = recalled;
    }


}
