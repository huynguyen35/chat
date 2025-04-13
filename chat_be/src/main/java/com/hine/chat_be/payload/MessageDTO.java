package com.hine.chat_be.payload;

import com.hine.chat_be.entity.Conversation;
import com.hine.chat_be.entity.Message;

import java.util.List;

public class MessageDTO {
    private Long id;
    private Conversation conversation;
    private UserInfo sender;
    private String content;
    private String type;
    private String sentAt;

    public MessageDTO(Long id, Conversation conversation, UserInfo sender, String content, String type, String sentAt) {
        this.id = id;
        this.conversation = conversation;
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.sentAt = sentAt;
    }

    public MessageDTO() {
    }

    public MessageDTO toDTO(Message message) {
        return new MessageDTO(message.getId().longValue(), message.getConversation(), new UserInfo().toUserDTO(message.getSender()), message.getContent(), message.getMessageType().toString(), message.getSentAt().toString());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conversation getConversation() {
        return conversation;
    }


    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
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


}
