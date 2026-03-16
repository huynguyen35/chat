import ScrollableFeed from "react-scrollable-feed";
import MessageItem from "./MessageItem";

const ScrollableChat = ({messages, onRecall, onForward}) => {
    return (
        <ScrollableFeed>
            {messages &&
                messages.map((m, i) => (
                        <MessageItem
                            key={m.id}
                            message={m}
                            prevMessages={messages}
                            index={i}
                            onRecall={onRecall}
                            onForward={onForward}
                        />
                    )
                )}
        </ScrollableFeed>
    );
};

export default ScrollableChat;
