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
    const {selectedChat, setSelectedChat, user, chats} = ChatState();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [callStatus, setCallStatus] = useState("idle"); // idle | calling | ringing | in-call
    const [incomingCallerName, setIncomingCallerName] = useState("");
    const [callDurationSec, setCallDurationSec] = useState(0);
    const callStartRef = useRef(null);
    const durationTimerRef = useRef(null);
    const inputRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerRef = useRef(null);
    const pendingOfferRef = useRef(null);
    const callStatusRef = useRef("idle");
    const callConversationIdRef = useRef(null);
    const callIsCallerRef = useRef(false);
    const callAnsweredRef = useRef(false);
    const callReceiverIdRef = useRef(null);
    const sendCallSignalRef = useRef(null);

    const {open, onOpen, onClose} = useDisclosure();

    // Sử dụng useCallback cho onMessage
    const handleNewMessage = useCallback((message) => {
        const incoming =
            message?.id ? message :
                message?.value?.id ? message.value :
                    message?.message?.id ? message.message :
                        message?.payload?.id ? message.payload :
                            message;
        // Kiểm tra xem tin nhắn có phải cho cuộc trò chuyện hiện tại không
        // (Điều này quan trọng nếu server gửi tin nhắn mà không lọc theo conversationId cụ thể trên client,
        // hoặc nếu bạn có nhiều subscription từ các instance useSocket khác nhau)
        // Tuy nhiên, useSocket của bạn đã subscribe theo conversationId, nên bước này có thể không quá cần thiết
        // nhưng là một lớp bảo vệ tốt.
        // Ví dụ: if (message.conversationId === selectedChat?.id) {
        setMessages((prevMessages) => {
            const safePrev = Array.isArray(prevMessages) ? prevMessages : [];
            if (!incoming?.id) {
                return safePrev;
            }
            const existingIndex = safePrev.findIndex(m => m.id === incoming.id);
            if (existingIndex >= 0) {
                const next = [...safePrev];
                next[existingIndex] = {...safePrev[existingIndex], ...incoming};
                return next;
            }
            return [...safePrev, incoming];
        });
        // }
    }, [setMessages]); // selectedChat?.id có thể thêm vào dependency nếu bạn có kiểm tra conversationId bên trong

    const formatDuration = useCallback((seconds) => {
        const total = Math.max(0, seconds || 0);
        const s = total % 60;
        const m = Math.floor(total / 60) % 60;
        const h = Math.floor(total / 3600);
        const pad = (v) => String(v).padStart(2, "0");
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }, []);

    const endCallCleanup = useCallback(() => {
        const durationSec = callStartRef.current ? Math.floor((Date.now() - callStartRef.current) / 1000) : 0;
        const conversationId = callConversationIdRef.current || selectedChat?.id;
        if (peerRef.current) {
            peerRef.current.onicecandidate = null;
            peerRef.current.ontrack = null;
            try {
                peerRef.current.close();
            } catch (e) {
                console.warn("Failed to close peer connection", e);
            }
            peerRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        pendingOfferRef.current = null;
        callStartRef.current = null;
        setCallDurationSec(0);
        setIncomingCallerName("");
        setCallStatus("idle");
        callConversationIdRef.current = null;

        if (callIsCallerRef.current && conversationId) {
            let receiverId = callReceiverIdRef.current;
            if (!receiverId && Array.isArray(chats)) {
                const chat = chats.find((c) => c.id === conversationId);
                receiverId = chat?.members?.find((u) => u.user.id !== user.id)?.user.id || null;
            }
            const answered = callAnsweredRef.current && durationSec > 0;
            const content = answered
                ? `Cuoc goi ket thuc (${formatDuration(durationSec)})`
                : "Cuoc goi nho";
            if (receiverId) {
                sendMessage("/app/chat.send", {
                    content,
                    conversationId,
                    senderId: user.id,
                    receiverId,
                    type: "CALL",
                });
            }
        }

        callIsCallerRef.current = false;
        callAnsweredRef.current = false;
        callReceiverIdRef.current = null;
    }, [formatDuration, selectedChat?.id, user, chats, sendMessage]);

    const handleCallSignal = useCallback(async (signal) => {
        if (!signal || !signal.conversationId) return;
        if (signal.fromUserId === user.id) return;

        const currentStatus = callStatusRef.current;
        const conversationId = signal.conversationId;
        const activeConversationId = callConversationIdRef.current || selectedChat?.id;

        if (signal.type === "OFFER") {
            callIsCallerRef.current = false;
            callAnsweredRef.current = false;
            if (currentStatus !== "idle") {
                sendCallSignalRef.current?.({
                    conversationId: conversationId,
                    type: "BUSY",
                });
                return;
            }

            let chat = null;
            if (selectedChat?.id === conversationId) {
                chat = selectedChat;
            } else if (Array.isArray(chats)) {
                chat = chats.find((c) => c.id === conversationId) || null;
            }

            if (chat && (!selectedChat || selectedChat.id !== conversationId)) {
                setSelectedChat(chat);
            }

            const otherName = chat ? getSender(user, chat.members) : "Mot cuoc goi den";
            pendingOfferRef.current = signal.sdp;
            callConversationIdRef.current = conversationId;
            setIncomingCallerName(otherName || "Mot cuoc goi den");
            setCallStatus("ringing");
            return;
        }

        if (activeConversationId && conversationId !== activeConversationId) {
            return;
        }

        if (signal.type === "ANSWER") {
            callAnsweredRef.current = true;
            if (!peerRef.current || !signal.sdp) return;
            await peerRef.current.setRemoteDescription({type: "answer", sdp: signal.sdp});
            setCallStatus("in-call");
            return;
        }

        if (signal.type === "ICE") {
            if (!peerRef.current || !signal.candidate) return;
            try {
                const candidate = JSON.parse(signal.candidate);
                await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
                console.error("Failed to add ICE candidate:", e);
            }
            return;
        }

        if (signal.type === "HANGUP" || signal.type === "REJECT" || signal.type === "BUSY") {
            if (signal.type === "REJECT") {
                toaster.create({
                    title: "Cuoc goi bi tu choi",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (signal.type === "BUSY") {
                toaster.create({
                    title: "Nguoi dung dang ban",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                    position: "bottom",
                });
            }
            endCallCleanup();
        }
    }, [chats, selectedChat, setSelectedChat, user.id]);
    const {sendMessage} = useSocket({
        userId: user.id,
        conversationId: selectedChat?.id,
        onMessage: handleNewMessage, // Truyền hàm đã được bọc bởi useCallback
        onCallSignal: handleCallSignal,
        // onNotification: handleNewNotification, // Nếu có, cũng nên dùng useCallback
    });

    useEffect(() => {
        callStatusRef.current = callStatus;
    }, [callStatus]);

    useEffect(() => {
        if (callStatus === "in-call") {
            if (!callStartRef.current) {
                callStartRef.current = Date.now();
            }
            setCallDurationSec(Math.floor((Date.now() - callStartRef.current) / 1000));
            if (!durationTimerRef.current) {
                durationTimerRef.current = setInterval(() => {
                    if (callStartRef.current) {
                        setCallDurationSec(Math.floor((Date.now() - callStartRef.current) / 1000));
                    }
                }, 1000);
            }
        } else {
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
                durationTimerRef.current = null;
            }
        }
        return () => {
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
                durationTimerRef.current = null;
            }
        };
    }, [callStatus]);

    const sendCallSignal = useCallback((payload) => {
        const conversationId = payload.conversationId || callConversationIdRef.current || selectedChat?.id;
        if (!conversationId) return;
        sendMessage("/app/call.signal", {
            conversationId,
            fromUserId: user.id,
            ...payload,
        });
    }, [sendMessage, selectedChat?.id, user.id]);

    useEffect(() => {
        sendCallSignalRef.current = sendCallSignal;
    }, [sendCallSignal]);

    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{urls: "stun:stun.l.google.com:19302"}],
        });
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendCallSignal({
                    type: "ICE",
                    candidate: JSON.stringify(event.candidate),
                });
            }
        };
        pc.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };
        return pc;
    }, [sendCallSignal]);

    const startCall = useCallback(async () => {
        if (!selectedChat || selectedChat.group) {
            toaster.create({
                title: "Chi ho tro goi 1-1",
                status: "warning",
                duration: 2500,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (callStatusRef.current !== "idle") {
            toaster.create({
                title: "Dang co cuoc goi",
                status: "info",
                duration: 2000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        callIsCallerRef.current = true;
        callAnsweredRef.current = false;
        callReceiverIdRef.current = selectedChat?.members?.find((u) => u.user.id !== user.id)?.user.id || null;

        try {
            setCallStatus("calling");
            callConversationIdRef.current = selectedChat.id;
            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
            localStreamRef.current = stream;

            const pc = createPeerConnection();
            peerRef.current = pc;
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendCallSignal({
                type: "OFFER",
                sdp: offer.sdp,
            });
        } catch (error) {
            console.error("Call start error:", error);
            toaster.create({
                title: "Khong the bat dau cuoc goi",
                description: error?.message || "Vui long kiem tra quyen micro",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            endCallCleanup();
        }
    }, [createPeerConnection, endCallCleanup, selectedChat, sendCallSignal]);

    const acceptCall = useCallback(async () => {
        const conversationId = callConversationIdRef.current || selectedChat?.id;
        if (!pendingOfferRef.current || !conversationId) return;
        try {
            callIsCallerRef.current = false;
            callAnsweredRef.current = true;
            setCallStatus("in-call");
            callConversationIdRef.current = conversationId;

            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
            localStreamRef.current = stream;

            const pc = createPeerConnection();
            peerRef.current = pc;
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            await pc.setRemoteDescription({type: "offer", sdp: pendingOfferRef.current});
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendCallSignal({
                type: "ANSWER",
                sdp: answer.sdp,
            });

            pendingOfferRef.current = null;
        } catch (error) {
            console.error("Accept call error:", error);
            toaster.create({
                title: "Khong the nhan cuoc goi",
                description: error?.message || "Vui long kiem tra quyen micro",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
            });
            endCallCleanup();
        }
    }, [createPeerConnection, endCallCleanup, selectedChat, sendCallSignal]);

    const declineCall = useCallback(() => {
        sendCallSignal({type: "REJECT"});
        endCallCleanup();
    }, [endCallCleanup, sendCallSignal]);

    const hangupCall = useCallback(() => {
        sendCallSignal({type: "HANGUP"});
        endCallCleanup();
    }, [endCallCleanup, sendCallSignal]);




    const addEmoji = (e) => {
        setNewMessage(prev => prev + e.native);
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const data = await fetchChats(selectedChat.id);
            setMessages(Array.isArray(data) ? data : []);
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

    const handleRecallMessage = useCallback((message) => {
        if (!selectedChat || !message?.id) return;
        const payload = {
            messageId: message.id,
            conversationId: selectedChat.id,
        };
        sendMessage("/app/chat.recall", payload);
        setMessages((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            return safePrev.map((m) => m.id === message.id ? {...m, isRecalled: true} : m);
        });
        toaster.create({
            title: "Đã thu hồi tin nhắn",
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "bottom",
        });
    }, [selectedChat, sendMessage]);

    const handleForwardMessage = useCallback((message) => {
        if (!message?.content) return;
        const forwardText = `[Chuyển tiếp] ${message.content}`;
        setNewMessage(forwardText);
        setShowEmojiPicker(false);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange?.(forwardText.length, forwardText.length);
        });
    }, []);

    useEffect(() => {
        if (selectedChat) { // Chỉ fetch khi có selectedChat
            fetchMessages();
        } else {
            setMessages([]); // Xóa tin nhắn khi không có chat nào được chọn
        }
    }, [selectedChat]); // Không cần fetchMessages làm dependency vì nó không thay đổi

    useEffect(() => {
        return () => {
            if (callStatusRef.current !== "idle") {
                sendCallSignalRef.current?.({type: "HANGUP"});
            }
            endCallCleanup();
        };
    }, [selectedChat?.id, endCallCleanup]);
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
                                        onClick={startCall}
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
                        {callStatus !== "idle" && (
                            <Box
                                bg="white"
                                border="1px solid #CBD5E0"
                                borderRadius="md"
                                p={2}
                                mb={3}
                            >
                                <Flex align="center" justify="space-between">
                                    <Text fontSize="sm">
                                        {callStatus === "calling" && "�ang g?i..."}
                                        {callStatus === "ringing" && `Cu?c g?i d?n t? ${incomingCallerName}`}
                                        {callStatus === "in-call" && `Dang trong cuoc goi (${formatDuration(callDurationSec)})`}
                                    </Text>
                                    <Flex gap={2}>
                                        {callStatus === "ringing" && (
                                            <>
                                                <Button size="sm" colorScheme="green" onClick={acceptCall}>
                                                    Nh?n
                                                </Button>
                                                <Button size="sm" colorScheme="red" onClick={declineCall}>
                                                    T? ch?i
                                                </Button>
                                            </>
                                        )}
                                        {(callStatus === "calling" || callStatus === "in-call") && (
                                            <Button size="sm" colorScheme="red" onClick={hangupCall}>
                                                K?t th�c
                                            </Button>
                                        )}
                                    </Flex>
                                </Flex>
                            </Box>
                        )}
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
                                <ScrollableChat
                                    messages={messages}
                                    onRecall={handleRecallMessage}
                                    onForward={handleForwardMessage}
                                />
                            </div>
                        )}
                        <Flex position="relative" mt={3}>
                            <Textarea
                                ref={inputRef}
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
                    <audio ref={remoteAudioRef} autoPlay />
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


