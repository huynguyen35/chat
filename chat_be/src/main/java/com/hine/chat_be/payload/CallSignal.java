package com.hine.chat_be.payload;

public class CallSignal {
    private Long conversationId;
    private Long fromUserId;
    private String type;
    private String sdp;
    private String candidate;

    public CallSignal() {
    }

    public CallSignal(Long conversationId, Long fromUserId, String type, String sdp, String candidate) {
        this.conversationId = conversationId;
        this.fromUserId = fromUserId;
        this.type = type;
        this.sdp = sdp;
        this.candidate = candidate;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(Long fromUserId) {
        this.fromUserId = fromUserId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSdp() {
        return sdp;
    }

    public void setSdp(String sdp) {
        this.sdp = sdp;
    }

    public String getCandidate() {
        return candidate;
    }

    public void setCandidate(String candidate) {
        this.candidate = candidate;
    }
}
