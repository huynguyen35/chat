package com.hine.chat_be.repository;

import com.hine.chat_be.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiver_Id(Long receiverId);

}
