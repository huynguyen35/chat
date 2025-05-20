package com.hine.chat_be.service.impl;

import com.hine.chat_be.entity.Conversation;
import com.hine.chat_be.entity.Message;
import com.hine.chat_be.entity.Notification;
import com.hine.chat_be.entity.User;
import com.hine.chat_be.entity.enums.NotificationType;
import com.hine.chat_be.payload.MessageDTO;
import com.hine.chat_be.payload.MessageRequest;
import com.hine.chat_be.payload.NotificationDTO;
import com.hine.chat_be.payload.UserInfo;
import com.hine.chat_be.repository.ConversationRepository;
import com.hine.chat_be.repository.MessageRepository;
import com.hine.chat_be.repository.NotificationRepository;
import com.hine.chat_be.repository.UserRepository;
import com.hine.chat_be.service.ConversationService;
import com.hine.chat_be.service.MessageService;
import com.hine.chat_be.service.NotificationService;
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
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;





    @Override
    @Transactional
    public MessageDTO sendMessage(MessageRequest request) {
        Conversation conversation = conversationRepository.findPrivateConversation(request.getSenderId(), request.getReceiverId())
                .orElseGet(() -> conversationService.createPrivateConversation(request.getSenderId(), request.getReceiverId()));

        User sender = userRepository.findById(request.getSenderId()).orElseThrow(() -> new RuntimeException("User not found"));
        User receiver = userRepository.findById(request.getReceiverId()).orElseThrow(() -> new RuntimeException("User not found"));

        // Save the message
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setMessageType(request.getType());
        message = messageRepository.save(message);

        // Create, save, and send the notification
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setNotificationType(NotificationType.MESSAGE);
        notification.setReferenceId(conversation.getId());
        notification.setContent("Bạn có tin nhắn mới từ " + sender.getFirstName() + " " + sender.getLastName());
        notification.setRead(false);
        notification = notificationRepository.save(notification);

        NotificationDTO notificationDTO = new NotificationDTO().toDTO(notification);

        MessageDTO messageDTO = new MessageDTO().toDTO(message);

        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), messageDTO);

        // Send notification to the receiver
        notificationService.senNotificationToUser(receiver.getId(), notificationDTO);

        return messageDTO;
    }

    @Override
    public List<MessageDTO> getMessages(Integer conversationId) {
        List<Message> messages = messageRepository.findByConversationId(conversationId);
        return messages.stream()
                .map(message -> new MessageDTO().toDTO(message))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Message> recallMessage(Long messageId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isPresent()) {
            Message message = messageOptional.get();
            message.setRecalled(true);
            messageRepository.save(message);
            return Optional.of(message);
        } else {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Message> deleteMessage(Long messageId) {
        Optional<Message> messageOptional = messageRepository.findById(messageId);
        if (messageOptional.isPresent()) {
            Message message = messageOptional.get();
            message.setDeleted(true);
            messageRepository.save(message);
            return Optional.of(message);
        } else {
            return Optional.empty();
        }
    }
}
