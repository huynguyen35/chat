package com.hine.chat_be.controller;

import com.hine.chat_be.payload.MessageDTO;
import com.hine.chat_be.payload.MessageRequest;
import com.hine.chat_be.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Controller
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageRequest request) {
        MessageDTO savedMessage = messageService.sendMessage(request);
        // Send the message to the appropriate topic
        messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId(), savedMessage);
        return ResponseEntity.ok(savedMessage);
    }
}
