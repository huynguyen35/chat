package com.hine.chat_be.controller;

import com.hine.chat_be.payload.ConversationDTO;
import com.hine.chat_be.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/conversation")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getConversations(@PathVariable Long userId) {
        List<ConversationDTO> conversations = conversationService.getConversations(userId);

        if (conversations.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Chưa có cuộc trò chuyện nào");
        }

        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/private")
    public ResponseEntity<?> getOrCreatePrivateConversation(@RequestParam Long user1, @RequestParam Long user2) {
        ConversationDTO conversation = conversationService.getOrCreatePrivateConversation(user1, user2);
        return ResponseEntity.ok(conversation);
    }

}
