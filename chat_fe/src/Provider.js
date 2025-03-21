import React, { createContext, useContext, useEffect, useState } from "react";
import {useLocation, useNavigate} from "react-router-dom";

const ChatContext = createContext();

const Provider = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState();
    const [user, setUser] = useState();
    const [notification, setNotification] = useState([]);
    const [chats, setChats] = useState();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const userInfo ={}
        setUser(userInfo);

        if (!userInfo && location.pathname !== "/signup") navigate("/login");
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
    return useContext(ChatContext);
};

export default Provider;
