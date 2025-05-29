// SingleChat.js
import {AvatarFallback, AvatarImage, AvatarRoot, Box, Text, useDisclosure} from "@chakra-ui/react";
import {Button, Flex, IconButton, Spinner, Textarea} from "@chakra-ui/react";
import {MdArrowBackIos} from "react-icons/md";
// Thêm useCallback vào import từ React
import {useEffect, useRef, useState, useCallback} from "react";
import axios from "axios";
// SockJS, Stomp, CompatClient không cần thiết ở đây nếu useSocket đã xử lý
// import SockJS from "sockjs-client";
// import {CompatClient, Stomp} from "@stomp/stompjs";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import {GrPhone, GrVideo, GrView} from "react-icons/gr";
import {BsSend, BsEmojiGrin, BsImage} from "react-icons/bs";
import {ChatState} from "../ChatProvider";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import {getSender, getSenderFull} from "../config/ChatLogics";
import "./styles.css";
import {toaster} from "./ui/toaster";
import {fetchChats} from "../callAPI/API"; // Đảm bảo API này đúng
import useSocket from "../hooks/useSocket";


const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const {selectedChat, setSelectedChat, user} = ChatState();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const {open, onOpen, onClose} = useDisclosure();

    // Sử dụng useCallback cho onMessage
    const handleNewMessage = useCallback((message) => {
        // Kiểm tra xem tin nhắn có phải cho cuộc trò chuyện hiện tại không
        // (Điều này quan trọng nếu server gửi tin nhắn mà không lọc theo conversationId cụ thể trên client,
        // hoặc nếu bạn có nhiều subscription từ các instance useSocket khác nhau)
        // Tuy nhiên, useSocket của bạn đã subscribe theo conversationId, nên bước này có thể không quá cần thiết
        // nhưng là một lớp bảo vệ tốt.
        // Ví dụ: if (message.conversationId === selectedChat?.id) {
        setMessages((prevMessages) => {
            // Tránh thêm tin nhắn trùng lặp nếu đã có
            if (prevMessages.find(m => m.id === message.id)) { // Giả sử tin nhắn có 'id' duy nhất
                return prevMessages;
            }
            return [...prevMessages, message];
        });
        // }
    }, [setMessages]); // selectedChat?.id có thể thêm vào dependency nếu bạn có kiểm tra conversationId bên trong

    const {sendMessage} = useSocket({
        userId: user.id,
        conversationId: selectedChat?.id,
        onMessage: handleNewMessage, // Truyền hàm đã được bọc bởi useCallback
        // onNotification: handleNewNotification, // Nếu có, cũng nên dùng useCallback
    });


    const addEmoji = (e) => {
        setNewMessage(prev => prev + e.native);
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const {data} = await fetchChats(selectedChat.id);
            setMessages(data);
            setLoading(false);
        } catch (error) {
            toaster.create({
                title: "Lỗi khi tải tin nhắn",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false); // Đảm bảo loading được set false khi có lỗi
        }
    };

    const handleSend = () => {
        const content = newMessage.trim();
        if (!content || !selectedChat) return; // Thêm kiểm tra selectedChat

        const msgRequest = {
            content: content, // Sửa lại: content thay vì newMessage để lấy giá trị đã trim
            conversationId: selectedChat.id,
            senderId: user.id,
            // receiverId có thể không cần thiết nếu server xử lý qua conversationId topic
            receiverId: !selectedChat.group ? selectedChat.members.find(
                (u) => u.user.id !== user.id
            )?.user.id : undefined, // Hoặc null
            type: "TEXT",
        };

        console.log("Sending message:", msgRequest);
        sendMessage("/app/chat.send", msgRequest);
        setNewMessage("");
    };

    useEffect(() => {
        if (selectedChat) { // Chỉ fetch khi có selectedChat
            fetchMessages();
        } else {
            setMessages([]); // Xóa tin nhắn khi không có chat nào được chọn
        }
    }, [selectedChat]); // Không cần fetchMessages làm dependency vì nó không thay đổi

    // console.log("Current messages in SingleChat:", messages); // Log để debug

    // ... JSX của bạn không đổi
    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{base: "28px", md: "30px"}}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{base: "space-between"}}
                        alignItems="center"
                    >
                        <IconButton
                            display="flex"
                            variant="ghost"
                            onClick={() => setSelectedChat("")}
                        >
                            <MdArrowBackIos/>
                        </IconButton>
                        {!selectedChat.group ? (
                            <>
                                {getSender(user, selectedChat.members)}
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <IconButton
                                        display={"flex"}
                                        variant="ghost"
                                    >
                                        <GrPhone/>
                                    </IconButton>

                                    <IconButton
                                        display={"flex"}
                                        variant="ghost"
                                    >
                                        <GrVideo/>
                                    </IconButton>

                                    <Button variant="ghost" size="sm" onClick={onOpen}>
                                        <AvatarRoot colorPalette="green" size="sm">
                                            <AvatarFallback
                                                name={getSenderFull(user, selectedChat.members).user.firstName}/>
                                            <AvatarImage src={getSenderFull(user, selectedChat.members).user.avt}
                                                         alt={getSenderFull(user, selectedChat.members).user.firstName}/>
                                        </AvatarRoot>
                                    </Button>

                                    <ProfileModal
                                        user={getSenderFull(user, selectedChat.members).user}
                                        isOpen={open}
                                        onClose={onClose}
                                        from="conversation"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal
                                    fetchMessages={fetchMessages}
                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                />
                            </>
                        )}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages}/>
                            </div>
                        )}
                        <Flex position="relative" mt={3}>
                            <Textarea
                                flex="1"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Nhập tin nhắn..."
                                resize="none"
                                bg="#E0E0E0"
                                variant="filled"
                                rows={1}
                            />

                            <IconButton
                                backgroundColor="#38B2AC"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                ml={2}
                            >
                                <BsEmojiGrin/>
                            </IconButton>

                            <IconButton
                                backgroundColor="#38B2AC"
                                ml={2}
                                // onClick={handleSendImage} // Cần hàm xử lý gửi ảnh
                            >
                                <BsImage/>
                            </IconButton>

                            <IconButton
                                ml={2}
                                backgroundColor="deepskyblue"
                                onClick={handleSend}
                                isDisabled={!newMessage.trim()}
                            >
                                <BsSend/>
                            </IconButton>

                            {showEmojiPicker && (
                                <Box position="absolute" bottom="60px" right="80px" zIndex="100">
                                    <Picker data={data} onEmojiSelect={addEmoji} theme="light"/>
                                </Box>
                            )}
                        </Flex>
                    </Box>
                </>
            ) : (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="100%"
                >
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Chọn một cuộc trò chuyện để bắt đầu trò chuyện
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;