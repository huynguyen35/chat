import ScrollableFeed from "react-scrollable-feed";
import MessageItem from "./MessageItem";

const ScrollableChat = ({messages}) => {
    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => (
                        <MessageItem
                            key={m.id}
                            message={m}
                            prevMessages={messages}
                            index={i}
                        />
                    )
                )}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
