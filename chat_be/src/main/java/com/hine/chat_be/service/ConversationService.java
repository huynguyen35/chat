package com.hine.chat_be.service;

import com.hine.chat_be.entity.Conversation;
import com.hine.chat_be.payload.ConversationDTO;

import java.util.List;

public interface ConversationService {

    Conversation createPrivateConversation(Long user1, Long user2);

    ConversationDTO getOrCreatePrivateConversation(Long user1, Long user2);

    List<ConversationDTO> getConversations(Long userId);
}
