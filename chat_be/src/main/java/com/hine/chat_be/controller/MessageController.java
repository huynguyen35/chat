package com.hine.chat_be.controller;


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

    // Recall message
    @PutMapping("/recall/{messageId}")
    public ResponseEntity<?> recallMessage(@PathVariable Long messageId) {
        Optional<MessageDTO> message = messageService.recallMessage(messageId);

        if (message.isPresent()) {
            return ResponseEntity.ok(message.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tin nhắn không tồn tại");
        }
    }

    // Delete message
    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        Optional<MessageDTO> message = messageService.deleteMessage(messageId);

        if (message.isPresent()) {
            return ResponseEntity.ok(message.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tin nhắn không tồn tại");
        }
    }


}
