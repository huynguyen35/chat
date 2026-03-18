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
import {useCallback, useEffect, useState} from "react";
import {accessPrivateConversation, fetchConversation, searchUsers} from "../callAPI/API";
import ChatLoading from "./ChatLoading";
import {Spinner} from "@chakra-ui/react";
import ProfileModal from "./ProfileModal";
import {getSender} from "../config/ChatLogics";
import UserListItem from "./userAvatar/UserListItem";
import {ChatState} from "../ChatProvider";
import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";
import {toaster} from "./ui/toaster";
import Badge from '@mui/material/Badge';
import {styled} from "@mui/material/styles";
import useSocket from "../hooks/useSocket";


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

    const {open, onOpen, onClose, setOpen} = useDisclosure();
    const {open: isOpenProfile, onOpen: onOpenProfile, onClose: onCloseProfile} = useDisclosure();


    const navigate = useNavigate();

    console.log("[SideDrawer] User object for useSocket:", user);
    console.log("[SideDrawer] user.id for useSocket:", user?.id);

    const handleNewNotification = useCallback((newNoti) => {
        console.log("this is called");
        // Giả sử newNoti là một object có cấu trúc phù hợp với những gì bạn render
        // Ví dụ: { id: 'some-unique-id', content: 'New message from X', chat: { ... }, createdAt: 'timestamp' }
        setNotification((prevNotifications) => [newNoti, ...prevNotifications]);
        console.log("newNoti", newNoti);
        // Tùy chọn: Hiển thị toaster cho thông báo mới
        toaster.create({
            title: "Thông báo mới",
            description: newNoti.content || "Bạn có thông báo mới.", // Đảm bảo newNoti.content tồn tại
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top-right", // Hoặc vị trí bạn muốn
        });
    }, [setNotification]);

    useSocket({
        userId: user.id,
        conversationId: null,
        onMessage: null,
        onNotification: handleNewNotification, // Nếu có, cũng nên dùng useCallback
    })


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
            const data = await searchUsers(search, user?.id);
            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toaster.create({
                title: "Error Occured!",
                description: error?.response?.data || "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setSearchResult([]);
        }
    };

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const data = await accessPrivateConversation(user?.id, userId);
            console.log("[SideDrawer] accessChat data:", data);
            if (!data || !data.id) {
                throw new Error("Conversation not returned from server");
            }

            const refreshed = await fetchConversation(user?.id);
            setChats(refreshed);
            const selected = refreshed?.find((c) => c.id === data.id) || data;
            setSelectedChat(selected);
            setOpen(false);
        } catch (error) {
            toaster.create({
                title: "Error fetching the chat",
                description: error?.response?.data || error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } finally {
            setLoadingChat(false);
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
                <DrawerRoot
                    placement="start"
                    open={open}
                    onOpenChange={(details) => setOpen(details.open)}
                >
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
                                        <>
                                            {searchResult?.length ? (
                                                searchResult.map((user) => (
                                                    <UserListItem
                                                        key={user.id}
                                                        user={user}
                                                        handleFunction={() => accessChat(user.id)}
                                                    />
                                                ))
                                            ) : (
                                                <Text fontSize="sm" color="gray.500" mt={2}>
                                                    KhÃ´ng tÃ¬m tháº¥y káº¿t quáº£
                                                </Text>
                                            )}
                                        </>
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
