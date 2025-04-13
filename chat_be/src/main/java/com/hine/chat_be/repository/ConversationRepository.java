package com.hine.chat_be.repository;

import com.hine.chat_be.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {

    @Query("""
                SELECT c FROM Conversation c
                WHERE c.isGroup = false
                AND EXISTS (
                    SELECT 1 FROM ConversationMember cm1
                    WHERE cm1.conversation.id = c.id AND cm1.user.id = :user1
                )
                AND EXISTS (
                    SELECT 1 FROM ConversationMember cm2
                    WHERE cm2.conversation.id = c.id AND cm2.user.id = :user2
                )
            """)
    Optional<Conversation> findPrivateConversation(@Param("user1") Integer user1, @Param("user2") Integer user2);

    @Query("SELECT c FROM Conversation c JOIN c.conversationMembers cm WHERE cm.user.id = :userId")
    List<Conversation> findConversationsByUserId(@Param("userId") Integer userId);

}
