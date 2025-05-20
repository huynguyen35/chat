package com.hine.chat_be.service.impl;

import com.hine.chat_be.entity.Conversation;
import com.hine.chat_be.entity.ConversationMember;
import com.hine.chat_be.entity.enums.ConversationRole;
import com.hine.chat_be.entity.User;
import com.hine.chat_be.payload.ConversationDTO;
import com.hine.chat_be.payload.ConversationMemberDTO;
import com.hine.chat_be.repository.ConversationRepository;
import com.hine.chat_be.repository.UserRepository;
import com.hine.chat_be.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ConversationServiceImpl implements ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Conversation createPrivateConversation(Long user1, Long user2) {
        System.out.println("Creating private conversation between user " + user1 + " and user " + user2);
        Conversation conversation = new Conversation();
        conversation.setGroup(false);
        conversation = conversationRepository.save(conversation);

        User sender = userRepository.findById(user1).orElseThrow(() -> new RuntimeException("User not found"));
        User receiver = userRepository.findById(user2).orElseThrow(() -> new RuntimeException("User not found"+user2));

        if (conversation.getConversationMembers() == null) {
            conversation.setConversationMembers(new ArrayList<>());
        }

        conversation.getConversationMembers().add(new ConversationMember(conversation, sender, ConversationRole.MEMBER));
        conversation.getConversationMembers().add(new ConversationMember(conversation, receiver, ConversationRole.MEMBER));

        return conversationRepository.save(conversation);
    }

    @Override
    public List<ConversationDTO> getConversations(Long userId) {
        return conversationRepository.findConversationsByUserId(userId)
                .stream()
                .map(conversation -> {
                    return new ConversationDTO().toDTO(conversation);
                })
                .toList();
    }
}
