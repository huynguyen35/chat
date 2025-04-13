import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Provider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  console.log("messages", messages);
  return (
      <ScrollableFeed>
        {messages &&
            messages.map((m, i) => (
                <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: m.sender.id === user.id ? "flex-end" : "flex-start",
                    }}
                >
                  {/* Hiện avatar nếu là người khác và là tin nhắn cuối hoặc khác người */}
                  {m.sender.id !== user.id &&
                      (isSameSender(messages, m, i, user.id) || isLastMessage(messages, i, user.id)) && (
                          <Tooltip label={m.sender.firstName} placement="bottom-start" hasArrow>
                            <Avatar
                                mt="7px"
                                mr={1}
                                size="sm"
                                cursor="pointer"
                                name={`${m.sender.firstName} ${m.sender.lastName || ""}`}
                                src={m.sender.avatar || m.sender.pic}
                            />
                          </Tooltip>
                      )}


                  {/* Tin nhắn */}
                  <span
                      style={{
                        backgroundColor: m.sender.id === user.id ? "#BEE3F8" : "#B9F5D0",
                        marginLeft:
                            m.sender.id !== user.id
                                ? isSameSenderMargin(messages, m, i, user.id)
                                : 0,
                        marginRight: m.sender.id === user.id ? 10 : 0,
                        marginTop: isSameUser(messages, m, i) ? 3 : 10,
                        borderRadius: "20px",
                        padding: "5px 15px",
                        maxWidth: "75%",
                        whiteSpace: "pre-wrap"
                      }}
                  >
              {m.content}
            </span>
                </div>
            ))}
      </ScrollableFeed>
  );
};

export default ScrollableChat;
