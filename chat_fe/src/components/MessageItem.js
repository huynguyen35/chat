import React,{useState} from "react";
import {isLastMessage, isSameSender, isSameSenderMargin, isSameUser} from "../config/ChatLogics";
import {Tooltip} from "./ui/tooltip";
import {
    AvatarFallback,
    AvatarImage,
    AvatarRoot,
    IconButton, MenuArrow, MenuContent, MenuItem,
    MenuPositioner,
    MenuRoot,
    MenuTrigger,
    Portal
} from "@chakra-ui/react";
import {CiMenuKebab} from "react-icons/ci";
import {ChatState} from "../ChatProvider";

const MessageItem = ({ message, prevMessages, index }) => {
    const {user} = ChatState();
    const [isHover, setIsHover] = useState(false); // <-- useState được gọi ở cấp cao nhất của MessageItem

    const m = message; // Để cho dễ đọc hơn, giữ nguyên 'm' từ code gốc
    const messages = prevMessages; // Đổi tên để tránh nhầm lẫn
    const isSentByUser = m.sender.id === user.id; // Kiểm tra xem tin nhắn có phải của người dùng hiện tại không
    return (
        <div
            key={m.id}
            style={{
                display: "flex",
                justifyContent: m.sender.id === user.id ? "flex-end" : "flex-start",
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            {isHover && isSentByUser && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: m.sender.id === user.id ? 0 : 8,
                        marginRight: m.sender.id === user.id ? 8 : 0,
                    }}
                >
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <IconButton
                                size="2xs"
                                color="gray"
                                variant="ghost"
                                backgroundColor="transparent"
                                marginTop="10px"
                                padding="5px"
                            >
                                <CiMenuKebab/>
                            </IconButton>
                        </MenuTrigger>
                        <Portal>
                            <MenuPositioner>
                                <MenuArrow/>
                                <MenuContent>
                                    <MenuItem value="chuyentiep">Chuyển tiếp</MenuItem>
                                    <MenuItem
                                        value="recall"
                                        color="fg.error"
                                        _hover={{bg: "bg.error", color: "fg.error"}}
                                    >
                                        Thu hồi
                                    </MenuItem>
                                </MenuContent>
                            </MenuPositioner>
                        </Portal>
                    </MenuRoot>
                </div>
            )}

            {/* Hiện avatar nếu là người khác và là tin nhắn cuối hoặc khác người */}
            {m.sender.id !== user.id &&
                (isSameSender(messages, m, index, user.id) || isLastMessage(messages, index, user.id)) && (
                    <Tooltip showArrow content={`${m.sender.firstName} ${m.sender.lastName || ""}`}
                             positioning={{placement: "right-end"}}>
                        <AvatarRoot
                            size="xs"
                            colorPalette={"green"}
                            cursor="pointer"
                            marginTop={isSameUser(messages, m, index) ? "4px" : "10px"}
                            marginRight={1}
                        >
                            <AvatarFallback name={`${m.sender.firstName} ${m.sender.lastName || ""}`}/>
                            <AvatarImage src={m.sender.avatar || m.sender.pic}/>
                        </AvatarRoot>
                    </Tooltip>
                )}


            {/* Tin nhắn */}
            <span
                style={{
                    backgroundColor: m.sender.id === user.id ? "#BEE3F8" : "#B9F5D0",
                    marginLeft:
                        m.sender.id !== user.id
                            ? isSameSenderMargin(messages, m, index, user.id)
                            : 0,
                    marginRight: m.sender.id === user.id ? 10 : 0,
                    marginTop: isSameUser(messages, m, index) ? 3 : 10,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap"
                }}
            >
                            {m.content}
                        </span>

            {isHover && !isSentByUser && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: m.sender.id === user.id ? 0 : 8,
                        marginRight: m.sender.id === user.id ? 8 : 0,
                    }}
                >
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <IconButton
                                size="2xs"
                                color="gray"
                                variant="ghost"
                                backgroundColor="transparent"
                                marginTop="10px"
                                padding="5px"
                            >
                                <CiMenuKebab/>
                            </IconButton>
                        </MenuTrigger>
                        <Portal>
                            <MenuPositioner>
                                <MenuArrow/>
                                <MenuContent>
                                    <MenuItem value="chuyentiep">Chuyển tiếp</MenuItem>
                                    <MenuItem
                                        value="recall"
                                        color="fg.error"
                                        _hover={{bg: "bg.error", color: "fg.error"}}
                                    >
                                        Thu hồi
                                    </MenuItem>
                                </MenuContent>
                            </MenuPositioner>
                        </Portal>
                    </MenuRoot>
                </div>
            )}


        </div>
    );
}
export default MessageItem;