import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function useSocket({ userId, onMessage, onNotification }) {
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log("[STOMP]", str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ WebSocket connected");

                // Subscribe to messages
                stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
                    const msg = JSON.parse(message.body);
                    onMessage?.(msg);
                });

                // Subscribe to notifications
                stompClient.subscribe(`/user/${userId}/queue/notifications`, (notification) => {
                    const noti = JSON.parse(notification.body);
                    onNotification?.(noti);
                });
            },
            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame);
            },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, [userId, onMessage, onNotification]);

    const sendMessage = (destination, payload) => {
        if (!stompClientRef.current?.connected) {
            console.error("❌ STOMP not connected");
            return;
        }

        stompClientRef.current.send(destination, {}, JSON.stringify(payload));
    };

    return { sendMessage };
}
