package com.hine.chat_be.service;

import com.hine.chat_be.entity.Message;
import com.hine.chat_be.payload.MessageDTO;
import com.hine.chat_be.payload.MessageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface MessageService {
    MessageDTO sendMessage(MessageRequest request);

    List<MessageDTO> getMessages(Integer conversationId);

    Optional<Message> recallMessage(Long messageId);

    Optional<Message> deleteMessage(Long messageId);
}
