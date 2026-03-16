package com.hine.chat_be.payload;

import com.hine.chat_be.entity.Conversation;

import java.util.List;

public class ConversationDTO {
    private Long id;
    private String name;
    private boolean isGroup;
    private String createdAt;
    private MessageDTO lastMessage;
    private List<ConversationMemberDTO> members;

    public ConversationDTO(Long id, String name, boolean isGroup, String createdAt, MessageDTO lastMessage, List<ConversationMemberDTO> members) {
        this.id = id;
        this.name = name;
        this.isGroup = isGroup;
        this.createdAt = createdAt;
        this.lastMessage = lastMessage;
        this.members = members;
    }
    public ConversationDTO() {
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
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
    public String getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    public MessageDTO getLastMessage() {
        return lastMessage;
    }
    public void setLastMessage(MessageDTO lastMessage) {
        this.lastMessage = lastMessage;
    }
    public List<ConversationMemberDTO> getMembers() {
        return members;
    }
    public void setMembers(List<ConversationMemberDTO> members) {
        this.members = members;
    }
    public ConversationDTO toDTO(Conversation conversation) {
        MessageDTO lastMessageDTO = conversation.getLastMessage() == null
                ? null
                : new MessageDTO().toDTO(conversation.getLastMessage());
        List<ConversationMemberDTO> memberDTOs = conversation.getConversationMembers() == null
                ? List.of()
                : new ConversationMemberDTO().toDTOList(conversation.getConversationMembers());

        return new ConversationDTO(
                conversation.getId(),
                conversation.getName(),
                conversation.isGroup(),
                conversation.getCreated_at().toString(),
                lastMessageDTO,
                memberDTOs
        );
    }

}
