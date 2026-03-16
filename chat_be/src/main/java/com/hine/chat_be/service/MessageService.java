package com.hine.chat_be.service;

import com.hine.chat_be.payload.MessageDTO;
import com.hine.chat_be.payload.MessageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface MessageService {
    MessageDTO sendMessage(MessageRequest request);

    List<MessageDTO> getMessages(Integer conversationId);

    Optional<MessageDTO> recallMessage(Long messageId);

    Optional<MessageDTO> deleteMessage(Long messageId);
}
