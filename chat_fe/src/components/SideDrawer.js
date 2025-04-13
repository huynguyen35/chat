import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
} from "@chakra-ui/menu";
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import ChatLoading from "./ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../config/ChatLogics";
import UserListItem from "./userAvatar/UserListItem";
import { ChatState } from "../Provider";

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


    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/login");
    };

    const handleSearch = async () => {
        if (!search) {
            toast({
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
            toast({
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
            toast({
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
            >
                <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text display={{ base: "none", md: "flex" }} px={4}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize="2xl" fontFamily="Work sans">
                    Talk-A-Tive
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            />
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size="sm"
                                cursor="pointer"
                                name={user.firstName}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>{" "}
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box d="flex" pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user.id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default SideDrawer;
