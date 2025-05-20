package com.hine.chat_be.payload;

import com.hine.chat_be.entity.ConversationMember;

import java.util.List;

public class ConversationMemberDTO {
    private Long id;
    private Long conversationId;
    private UserInfo user;
    private String role;
    private String joinedAt;

    public ConversationMemberDTO(Long id, Long conversationId, UserInfo user, String role, String joinedAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.user = user;
        this.role = role;
        this.joinedAt = joinedAt;
    }
    public ConversationMemberDTO() {
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
    public UserInfo getUser() {
        return user;
    }
    public void setUser(UserInfo user) {
        this.user = user;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public String getJoinedAt() {
        return joinedAt;
    }
    public void setJoinedAt(String joinedAt) {
        this.joinedAt = joinedAt;
    }
    public ConversationMemberDTO toDTO(ConversationMember conversationMember) {
        return new ConversationMemberDTO(conversationMember.getId(), conversationMember.getConversation().getId(), new UserInfo().toUserDTO(conversationMember.getUser()), conversationMember.getRole().toString(), conversationMember.getJoinedAt().toString());
    }
    public List<ConversationMemberDTO> toDTOList(List<ConversationMember> conversationMembers) {
        return conversationMembers.stream().map(this::toDTO).toList();
    }
}
