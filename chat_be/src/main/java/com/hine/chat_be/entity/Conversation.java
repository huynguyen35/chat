package com.hine.chat_be.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private boolean isGroup;
    @Column(columnDefinition = "TIMESTAMP", updatable = false)
    private LocalDateTime created_at = LocalDateTime.now();


    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ConversationMember> conversationMembers;

    public Conversation() {
    }

    public Conversation(Integer id, String name, boolean isGroup) {
        this.id = id;
        this.name = name;
        this.isGroup = isGroup;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isGroup() {
        return isGroup;
    }

    public void setGroup(boolean group) {
        isGroup = group;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public List<ConversationMember> getConversationMembers() {
        return conversationMembers;
    }

    public void setConversationMembers(List<ConversationMember> conversationMembers) {
        this.conversationMembers = conversationMembers;
    }



    @Override
    public String toString() {
        return "Conversations{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", isGroup=" + isGroup +
                ", created_at=" + created_at +
                '}';
    }
}
