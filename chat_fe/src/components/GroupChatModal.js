import {
    Button,
    useDisclosure,
    Input,
    DialogTrigger,
    Portal,
    DialogHeader,
    DialogBody,
    Box,
    DialogCloseTrigger,
    DialogRoot,
    DialogBackdrop,
    DialogPositioner, FieldRoot, FieldLabel, DialogFooter
} from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";
import axios from "axios";
import React, {useState} from "react";
import {ChatState} from "../ChatProvider";
import UserBadgeItem from "./userAvatar/UserBadgeItem";
import UserListItem from "./userAvatar/UserListItem";
import {toaster} from "./ui/toaster";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const GroupChatModal = ({children}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const {user, chats, setChats} = ChatState();

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toaster({
                title: "User Already Added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.get(`/api/user?search=${search}`, config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toaster.create({
                title: "Failed to Load the Search Results",
                description: error.response.data,
            });
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toaster.create({
                title: "Please fill all the feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.post(
                `/api/chat/group`,
                {
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );
            setChats([data, ...chats]);
            onClose();
            toaster.create({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        } catch (error) {
            toaster.create({
                title: "Failed to Create the Chat!",
                description: error.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <DialogRoot>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        borderRadius="100px"
                        color="white"
                        backgroundColor="#38B2AC"
                    >
                        <MdAdd/>Tạo nhóm
                    </Button>
                </DialogTrigger>
                <Portal>
                    <DialogBackdrop/>
                    <DialogPositioner>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo Nhóm Chat</DialogTitle>
                            </DialogHeader>
                            <DialogBody>
                                <FieldRoot>
                                    <FieldLabel>Tên Nhóm</FieldLabel>
                                    <Input
                                        placeholder="Vd: Nhóm abc"
                                        mb={3}
                                        onChange={(e) => setGroupChatName(e.target.value)}
                                    />
                                </FieldRoot>
                                <FieldRoot>
                                    <FieldLabel>Thêm Người Dùng</FieldLabel>
                                    <Input
                                        placeholder="Vd: user1, user2, user3"
                                        mb={1}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </FieldRoot>
                                <Box w="100%" d="flex" flexWrap="wrap">
                                    {selectedUsers.map((u) => (
                                        <UserBadgeItem
                                            key={u._id}
                                            user={u}
                                            handleFunction={() => handleDelete(u)}
                                        />
                                    ))}
                                </Box>
                                {loading ? (
                                    // <ChatLoading />
                                    <div>Loading...</div>
                                ) : (
                                    searchResult
                                        ?.slice(0, 4)
                                        .map((user) => (
                                            <UserListItem
                                                key={user._id}
                                                user={user}
                                                handleFunction={() => handleGroup(user)}
                                            />
                                        ))
                                )}
                            </DialogBody>
                            <DialogFooter>
                                <Button
                                    colorScheme="blue"
                                    onClick={handleSubmit}
                                    mr={3}
                                >
                                    Tạo Nhóm
                                </Button>
                                <DialogCloseTrigger asChild>
                                    <Button variant="ghost">Đóng</Button>
                                </DialogCloseTrigger>
                            </DialogFooter>
                        </DialogContent>
                    </DialogPositioner>
                </Portal>
            </DialogRoot>
        </>
    )
        ;
};

export default GroupChatModal;
