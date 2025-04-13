package com.hine.chat_be.service.impl;

import com.hine.chat_be.entity.Conversation;
import com.hine.chat_be.entity.Message;
import com.hine.chat_be.entity.User;
import com.hine.chat_be.payload.MessageDTO;
import com.hine.chat_be.payload.MessageRequest;
import com.hine.chat_be.payload.UserInfo;
import com.hine.chat_be.repository.ConversationRepository;
import com.hine.chat_be.repository.MessageRepository;
import com.hine.chat_be.repository.UserRepository;
import com.hine.chat_be.service.ConversationService;
import com.hine.chat_be.service.MessageService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;



    @Override
    @Transactional
    public MessageDTO sendMessage(MessageRequest request) {
        Conversation conversation = conversationRepository.findPrivateConversation(request.getSenderId(), request.getReceiverId())
                .orElseGet(() -> conversationService.createPrivateConversation(request.getSenderId(), request.getReceiverId()));

        User sender = userRepository.findById(request.getSenderId()).orElseThrow(() -> new RuntimeException("User not found"));
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setMessageType(request.getType());
        message = messageRepository.save(message);

        MessageDTO messageDTO = new MessageDTO().toDTO(message);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), messageDTO);

        return messageDTO;
    }

    @Override
    public List<MessageDTO> getMessages(Integer conversationId) {
        List<Message> messages = messageRepository.findByConversationId(conversationId);
        return messages.stream()
                .map(message -> new MessageDTO().toDTO(message))
                .collect(Collectors.toList());
    }
}
