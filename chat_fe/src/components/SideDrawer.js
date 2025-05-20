import {
    AvatarFallback, AvatarImage,
    AvatarRoot,
    Button,
    CloseButton, DrawerBackdrop, DrawerBody, DrawerCloseTrigger, DrawerContent, DrawerHeader, DrawerPositioner,
    DrawerRoot,
    MenuContent,
    MenuPositioner,
    MenuRoot,
    MenuTrigger,
    Portal,
    MenuItem, DrawerTrigger,
} from "@chakra-ui/react"
import {useDisclosure} from "@chakra-ui/react";
import {Input} from "@chakra-ui/react";
import {Box, Text} from "@chakra-ui/react";
import {FaChevronDown, FaBell,} from "react-icons/fa6";
import {FaSearch} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import {Spinner} from "@chakra-ui/react";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import {Effect} from "react-notification-badge";
import {getSender} from "../config/ChatLogics";
import UserListItem from "./userAvatar/UserListItem";
import {ChatState} from "../ChatProvider";
import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";
import {toaster} from "./ui/toaster";
import Badge from '@mui/material/Badge';
import {styled} from "@mui/material/styles";


function SideDrawer() {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const {
        setSelectedChat,
        user,
        notification,
        setNotification,
        chats,
        setChats,
    } = ChatState();

    const {open, onOpen, onClose} = useDisclosure();
    const {open: isOpenProfile, onOpen: onOpenProfile, onClose: onCloseProfile} = useDisclosure();


    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        // Khởi tạo WebSocket
        const stompClient = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("✅ Connected to WebSocket");

                stompClient.subscribe("/user/queue/notification", (message) => {
                    const notificationData = JSON.parse(message.body);
                    console.log("📨 Notification received", notificationData);

                    // Thêm vào danh sách notification
                    setNotification((prev) => [notificationData, ...prev]);
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
            },
        });

        stompClient.activate();

        return () => {
            stompClient.deactivate();
        };
    }, [user]);



    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/login");
    };

    const handleSearch = async () => {
        if (!search) {
            toaster.create({
                title: "Please Enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            // setSearchResult(data);
        } catch (error) {
            toaster.create({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const accessChat = async (userId) => {
        console.log(userId);

        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            // const { data } = await axios.post(`/api/chat`, { userId }, config);
            const data = [
                {
                    isGroupChat: false,
                    users: [
                        {
                            name: "John Doe",
                            email: "john@example.com",
                        },
                        {
                            name: "Piyush",
                            email: "piyush@example.com",
                        },
                    ],
                    _id: "617a077e18c25468bc7c4dd4",
                    chatName: "John Doe",
                },
                {
                    isGroupChat: false,
                    users: [
                        {
                            name: "Guest User",
                            email: "guest@example.com",
                        },
                        {
                            name: "Piyush",
                            email: "piyush@example.com",
                        },
                    ],
                    _id: "617a077e18c25468b27c4dd4",
                    chatName: "Guest User",
                },
                {
                    isGroupChat: false,
                    users: [
                        {
                            name: "Anthony",
                            email: "anthony@example.com",
                        },
                        {
                            name: "Piyush",
                            email: "piyush@example.com",
                        },
                    ],
                    _id: "617a077e18c2d468bc7c4dd4",
                    chatName: "Anthony",
                },
                {
                    isGroupChat: true,
                    users: [
                        {
                            name: "John Doe",
                            email: "jon@example.com",
                        },
                        {
                            name: "Piyush",
                            email: "piyush@example.com",
                        },
                        {
                            name: "Guest User",
                            email: "guest@example.com",
                        },
                    ],
                    _id: "617a518c4081150716472c78",
                    chatName: "Friends",
                    groupAdmin: {
                        name: "Guest User",
                        email: "guest@example.com",
                    },
                },
                {
                    isGroupChat: false,
                    users: [
                        {
                            name: "Jane Doe",
                            email: "jane@example.com",
                        },
                        {
                            name: "Piyush",
                            email: "piyush@example.com",
                        },
                    ],
                    _id: "617a077e18c25468bc7cfdd4",
                    chatName: "Jane Doe",
                },
                {
                    isGroupChat: true,
                    users: [
                        {
                            name: "John Doe",
                            email: "jon@example.com",
                        },
                        {
                            name: "Piyush",
                            email: "piyush@example.com",
                        },
                        {
                            name: "Guest User",
                            email: "guest@example.com",
                        },
                    ],
                    _id: "617a518c4081150016472c78",
                    chatName: "Chill Zone",
                    groupAdmin: {
                        name: "Guest User",
                        email: "guest@example.com",
                    },
                },
            ];

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toaster.create({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth="5px"
                borderRadius="lg"
                boxShadow="md"
            >
                <DrawerRoot placement="start" onOpenChange={onOpen} isOpen={open}>
                    <DrawerTrigger asChild>
                        <Button variant="ghost" onClick={onOpen}>
                            {/*<i className="fas fa-search"></i>*/}
                            <FaSearch/>
                            <Text display={{base: "none", md: "flex"}} px={4}>
                                Tìm kiếm
                            </Text>
                        </Button>
                    </DrawerTrigger>
                    <Portal>
                        <DrawerBackdrop/>
                        <DrawerPositioner>
                            <DrawerContent>
                                <DrawerHeader borderBottomWidth="1px">Tìm kiếm</DrawerHeader>
                                <DrawerBody>
                                    <Box d="flex" pb={2}>
                                        <Input
                                            placeholder="Tìm kiếm theo tên hoặc email"
                                            mr={2}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        <Button onClick={handleSearch}>Tìm kiếm</Button>
                                    </Box>
                                    {loading ? (
                                        <ChatLoading/>
                                    ) : (
                                        searchResult?.map((user) => (
                                            <UserListItem
                                                key={user._id}
                                                user={user}
                                                handleFunction={() => accessChat(user.id)}
                                            />
                                        ))
                                    )}
                                    {loadingChat && <Spinner ml="auto" display="flex"/>}
                                </DrawerBody>
                                <DrawerCloseTrigger asChild>
                                    <CloseButton size="sm"/>
                                </DrawerCloseTrigger>
                            </DrawerContent>
                        </DrawerPositioner>
                    </Portal>
                </DrawerRoot>

                <Text textStyle="3xl" fontFamily="Work sans">
                    Talk-A-Tive
                </Text>
                <div>
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <Badge color="primary" badgeContent={notification.length} overlap="circular">
                                    <FaBell fontSize="2xl" m={1}/>
                                </Badge>
                            </Button>
                        </MenuTrigger>
                        <Portal>
                            <MenuPositioner>
                                <MenuContent>
                                    {!notification.length && "Không có thông báo"}
                                    {notification.map((notif) => (
                                        <MenuItem
                                            key={notif.id}
                                            onClick={() => {
                                                setSelectedChat(notif.chat);
                                                setNotification(notification.filter((n) => n !== notif));
                                            }}
                                        >
                                            {notif.content}
                                            {notif.createdAt}
                                        </MenuItem>
                                    ))}
                                </MenuContent>
                            </MenuPositioner>
                        </Portal>
                    </MenuRoot>

                    <MenuRoot>
                        <MenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <AvatarRoot colorPalette="white" size="sm">
                                    <AvatarFallback name={user.firstName}/>
                                    <AvatarImage src={user.avt} alt={user.firstName}/>
                                </AvatarRoot>
                            </Button>
                        </MenuTrigger>
                        <Portal>
                            <MenuPositioner>
                                <MenuContent>
                                    <MenuItem value="my-profile"
                                              onClick={onOpenProfile}>
                                    Thông tin tài khoản</MenuItem>
                                    <MenuItem value="settings">Cài đặt</MenuItem>
                                    <MenuItem
                                        value="delete"
                                        color="fg.error"
                                        _hover={{bg: "bg.error", color: "fg.error"}}
                                        onClick={logoutHandler}
                                    >
                                        Đăng xuất
                                    </MenuItem>
                                </MenuContent>
                            </MenuPositioner>
                        </Portal>
                    </MenuRoot>
                </div>
            </Box>

            {user && (
                <ProfileModal user={user} isOpen={isOpenProfile} onClose={onCloseProfile} from={"profile"}>
                    <AvatarRoot colorPalette="white" size="sm">
                        <AvatarFallback name={user.name}/>
                        <AvatarImage src={user.pic} alt={user.name}/>
                    </AvatarRoot>
                </ProfileModal>
            )}

        </>
    );
}

export default SideDrawer;
