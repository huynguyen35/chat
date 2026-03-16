package com.hine.chat_be.controller;

import com.hine.chat_be.payload.CallSignal;
import com.hine.chat_be.repository.ConversationMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class CallController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationMemberRepository conversationMemberRepository;

    @MessageMapping("/call.signal")
    public void handleCallSignal(@Payload CallSignal signal) {
        if (signal == null || signal.getConversationId() == null) {
            return;
        }
        messagingTemplate.convertAndSend("/topic/call/" + signal.getConversationId(), signal);

        List<Long> memberIds = conversationMemberRepository.findUserIdsByConversationId(signal.getConversationId());
        for (Long memberId : memberIds) {
            if (signal.getFromUserId() != null && signal.getFromUserId().equals(memberId)) {
                continue;
            }
            messagingTemplate.convertAndSendToUser(String.valueOf(memberId), "/queue/call", signal);
        }
    }
}
