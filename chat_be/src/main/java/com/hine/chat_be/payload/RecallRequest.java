package com.hine.chat_be.payload;

public class RecallRequest {
    private Long messageId;
    private Long conversationId;

    public RecallRequest(Long messageId, Long conversationId) {
        this.messageId = messageId;
        this.conversationId = conversationId;
    }

    public RecallRequest() {
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }


}
