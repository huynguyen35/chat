// useSocket.js
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function useSocket({ userId, conversationId, onMessage, onNotification }) {
    const stompClientRef = useRef(null);
    const messageSubscriptionRef = useRef(null);
    const notificationSubscriptionRef = useRef(null);

    useEffect(() => {
        console.log(`[useSocket EFFECT RUN] userId: ${userId}, conversationId: ${conversationId}`);

        if (!userId) { // Chỉ cần userId cho notification, conversationId cho message
            console.log("[useSocket EFFECT] Missing userId. Notification subscription might not work.");
            // Không return ở đây nếu vẫn muốn message subscription hoạt động khi có conversationId
        }
        if (!conversationId && userId) {
            console.log("[useSocket EFFECT] Missing conversationId. Message subscription will not be set up.");
        }
        if (!userId && !conversationId) {
            console.log("[useSocket EFFECT] Missing userId and conversationId. Returning.");
            // Dọn dẹp client cũ nếu có
            if (stompClientRef.current?.active) {
                messageSubscriptionRef.current?.unsubscribe();
                notificationSubscriptionRef.current?.unsubscribe();
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                messageSubscriptionRef.current = null;
                notificationSubscriptionRef.current = null;
            }
            return;
        }


        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("[STOMP CLIENT DEBUG]", str), // Log debug từ thư viện STOMP
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`[useSocket ONCONNECT] ✅ WebSocket connected. UserID: ${userId}, ConvID: ${conversationId}`);
                stompClientRef.current = stompClient;

                // Hủy subscription cũ trước khi tạo mới (nếu có)
                messageSubscriptionRef.current?.unsubscribe();
                notificationSubscriptionRef.current?.unsubscribe();

                if (conversationId) {
                    console.log(`[useSocket ONCONNECT] Subscribing to messages /topic/conversation/${conversationId}`);
                    messageSubscriptionRef.current = stompClient.subscribe(
                        `/topic/conversation/${conversationId}`,
                        (message) => {
                            console.log(`[useSocket RAW STOMP MESSAGE] Received for /topic/conversation/${conversationId}`, message);
                            try {
                                const msg = JSON.parse(message.body);
                                console.log('[useSocket PARSED MESSAGE]', msg);
                                onMessage?.(msg);
                            } catch (e) {
                                console.error('[useSocket] Error parsing chat message JSON:', e, "Raw body:", message.body);
                            }
                        }
                    );
                }

                if (userId) {
                    console.log(`[useSocket ONCONNECT] Subscribing to notifications /user/${userId}/queue/notification`);
                    notificationSubscriptionRef.current = stompClient.subscribe(
                        `/user/${userId}/queue/notification`,
                        (notification) /* Đây là callback của thư viện STOMP */ => {
                            // THÊM LOG Ở ĐÂY ĐỂ XEM NÓ CÓ ĐƯỢC GỌI KHÔNG
                            console.log(`[useSocket RAW STOMP NOTIFICATION] Received for /user/${userId}/queue/notification. Raw object:`, notification);
                            console.log(`[useSocket RAW STOMP NOTIFICATION BODY] Body content:`, notification.body);

                            try {
                                const noti = JSON.parse(notification.body);
                                // THÊM LOG SAU KHI PARSE JSON
                                console.log('[useSocket PARSED NOTIFICATION]', noti);
                                // Gọi callback onNotification mà component đã truyền vào
                                if (onNotification) {
                                    onNotification(noti);
                                    console.log('[useSocket] Called onNotification prop with parsed data.');
                                } else {
                                    console.warn('[useSocket] onNotification prop was not provided.');
                                }
                            } catch (e) {
                                // LOG LỖI NẾU JSON.PARSE THẤT BẠI
                                console.error('[useSocket] Error parsing notification JSON:', e, "Raw body for error:", notification.body);
                            }
                        }
                    );
                }
            },
            onStompError: (frame) => {
                console.error(`[useSocket STOMP ERROR] UserID: ${userId}, ConvID: ${conversationId}`, frame);
            },
            onDisconnect: () => {
                console.log(`[useSocket ONDISCONNECT] ❌ WebSocket disconnected. UserID: ${userId}, ConvID: ${conversationId}`);
            }
        });

        console.log(`[useSocket EFFECT] Activating STOMP client. UserID: ${userId}, ConvID: ${conversationId}`);
        stompClient.activate();

        return () => {
            console.log(`[useSocket CLEANUP] Cleaning up. UserID: ${userId}, ConvID: ${conversationId}. Client active: ${stompClient?.active}`);
            if (messageSubscriptionRef.current) {
                messageSubscriptionRef.current.unsubscribe();
                messageSubscriptionRef.current = null;
            }
            if (notificationSubscriptionRef.current) {
                notificationSubscriptionRef.current.unsubscribe();
                notificationSubscriptionRef.current = null;
            }
            if (stompClient?.active) {
                stompClient.deactivate();
            }
            if (stompClientRef.current === stompClient) {
                stompClientRef.current = null;
            }
        };
    }, [userId, conversationId, onMessage, onNotification]); // Giữ onMessage, onNotification trong dependencies

    const sendMessage = (destination, payload) => {
        if (!stompClientRef.current?.connected) {
            console.error("❌ STOMP not connected when trying to send message. Client: ", stompClientRef.current);
            return;
        }
        stompClientRef.current.publish({
            destination,
            body: JSON.stringify(payload),
        });
    };

    return { sendMessage };
}