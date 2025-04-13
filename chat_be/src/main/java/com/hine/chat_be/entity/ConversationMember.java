package com.hine.chat_be.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.hine.chat_be.entity.enums.ConversationRole;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_member")
public class ConversationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "conversation_id", referencedColumnName = "id", nullable = false)
    @JsonBackReference
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private ConversationRole role = ConversationRole.MEMBER;

    @Column(columnDefinition = "TIMESTAMP", updatable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public ConversationMember() {
    }

    public ConversationMember(Conversation conversation, User user, ConversationRole role) {
        this.conversation = conversation;
        this.user = user;
        this.role = role;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ConversationRole getRole() {
        return role;
    }

    public void setRole(ConversationRole role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }





}
