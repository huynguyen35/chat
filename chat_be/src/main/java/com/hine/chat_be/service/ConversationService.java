package com.hine.chat_be.service;

import com.hine.chat_be.entity.Conversation;

import java.util.List;

public interface ConversationService {

    Conversation createPrivateConversation(Integer user1, Integer user2);

    List<Conversation> getConversations(Integer userId);
}
