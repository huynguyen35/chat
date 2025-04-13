package com.hine.chat_be.controller;


import com.hine.chat_be.entity.Message;
import com.hine.chat_be.payload.MessageDTO;
import com.hine.chat_be.payload.MessageRequest;
import com.hine.chat_be.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/{conversationId}")
    public ResponseEntity<?> getMessages(@PathVariable Integer conversationId) {
        List<MessageDTO> messages =  messageService.getMessages(conversationId);

        if (messages.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Chưa có tin nhắn nào");
        }

        return ResponseEntity.ok(messages);
    }



    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody MessageRequest request) {
        MessageDTO savedMessage = messageService.sendMessage(request);
        return ResponseEntity.ok(savedMessage);
    }


}
