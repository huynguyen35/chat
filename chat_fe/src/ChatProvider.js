import React, { createContext, useContext, useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {fetchNotification} from "./callAPI/API";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState();
    const [user, setUser] = useState();
    const [notification, setNotification] = useState([]);
    const [chats, setChats] = useState();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if (!userInfo && location.pathname !== "/signup") navigate("/login");

        // fetching notification
        const fetchNotifications = async () => {
            try {
                const data = await fetchNotification(userInfo.id);
                setNotification(data);

            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        if (userInfo) {
            fetchNotifications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    return (
        <ChatContext.Provider
            value={{
                selectedChat,
                setSelectedChat,
                user,
                setUser,
                notification,
                setNotification,
                chats,
                setChats,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("ChatState must be used within a ChatProvider");
    }
    return context;
};

export default ChatProvider;
