import {FormControl} from "@chakra-ui/form-control";
import {Input} from "@chakra-ui/input";
import {Box, Text} from "@chakra-ui/layout";
import {Button, Flex, IconButton, Spinner, Textarea, useToast} from "@chakra-ui/react";
import {ArrowBackIcon} from "@chakra-ui/icons";
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import {CompatClient, Stomp} from "@stomp/stompjs";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

import {ChatState} from "../Provider";
import ProfileModal from "./ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import {getSender, getSenderFull} from "../config/ChatLogics";
import "./styles.css";

const SOCKET_URL = "http://localhost:8080/ws";

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const {selectedChat, setSelectedChat, user} = ChatState();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);


    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);

    const toast = useToast();

    const addEmoji = (e) => {
        setNewMessage(prev => prev + e.native);
    };

    const connectWebSocket = () => {
        const socket = new SockJS(SOCKET_URL);
        const stompClient = Stomp.over(socket);

        stompClient.connect(
            {Authorization: `Bearer ${user.token}`},
            () => {
                setSocketConnected(true);
                stompClientRef.current = stompClient;

                if (selectedChat?.id) {
                    subscribeToChat(selectedChat.id);
                }
            },
            (error) => {
                console.error("WebSocket error:", error);
                setSocketConnected(false);
            }
        );
    };

    const subscribeToChat = (chatId) => {
        if (!stompClientRef.current) return;

        subscriptionRef.current = stompClientRef.current.subscribe(
            `/topic/conversation/${chatId}`,
            (messageOutput) => {
                const msg = JSON.parse(messageOutput.body);
                setMessages((prev) => {
                    const exists = prev.some((m) => m.id === msg.id); // tránh thêm trùng
                    if (!exists) return [...prev, msg];
                    return prev;
                });

            }
        );
    };

    const unsubscribeFromChat = () => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
        }
    };

    const disconnectWebSocket = () => {
        if (stompClientRef.current) {
            stompClientRef.current.disconnect(() => {
                setSocketConnected(false);
            });
            stompClientRef.current = null;
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.get(
                `http://localhost:8080/api/message/${selectedChat.id}`,
                config
            );
            setMessages(data);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Lỗi khi tải tin nhắn",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const sendMessage = () => {
        if (newMessage.trim() && stompClientRef.current && socketConnected) {
            const msgRequest = {
                content: newMessage,
                conversationId: selectedChat.id,
                senderId: user.id,
                receiverId: selectedChat.conversationMembers.find(
                    (u) => u.id !== user.id
                )?.id,
                type: "TEXT",
            };

            stompClientRef.current.send(
                "/app/chat.send",
                {},
                JSON.stringify(msgRequest)
            );

            setNewMessage("");
        }
    };


    useEffect(() => {
        connectWebSocket();

        return () => {
            unsubscribeFromChat();
            disconnectWebSocket();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedChat?.id && stompClientRef.current && socketConnected) {
            unsubscribeFromChat(); // hủy đăng ký cũ nếu có
            subscribeToChat(selectedChat.id); // đăng ký mới
            fetchMessages();
        }

        return () => {
            unsubscribeFromChat(); // hủy khi rời chat
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChat]);

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
                            display={{base: "flex", md: "none"}}
                            icon={<ArrowBackIcon/>}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.group ? (
                            <>
                                {getSender(user, selectedChat.conversationMembers)}
                                <ProfileModal
                                    user={getSenderFull(user, selectedChat.conversationMembers)}
                                />
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
                                sendMessage();
                              }
                            }}
                            placeholder="Nhập tin nhắn..."
                            resize="none"
                            bg="#E0E0E0"
                            variant="filled"
                            rows={1}
                        />
                        <Button onClick={() => setShowEmojiPicker(!showEmojiPicker)} ml={2}>
                          😊
                        </Button>
                        <Button
                            ml={2}
                            colorScheme="blue"
                            onClick={sendMessage}
                            isDisabled={!newMessage.trim()}
                        >
                          Gửi
                        </Button>

                        {showEmojiPicker && (
                            <Box position="absolute" bottom="60px" right="80px" zIndex="100">
                              <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
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
