export const isSameSenderMargin = (messages, m, i, userId) => {
    if (m.sender.id === userId) return "auto"; // tin nhắn của chính user thì không cần xử lý margin

    const isSameAsNext =
        i < messages.length - 1 && messages[i + 1].sender.id === m.sender.id;

    const isLastMsg = i === messages.length - 1;

    // Nếu là tin nhắn của người khác, và:
    // - là tin nhắn cuối
    // - hoặc khác người với tin nhắn tiếp theo => có avatar => margin = 0
    if (!isSameAsNext || isLastMsg) return 0;

    // nếu là chuỗi tiếp theo cùng người thì cần căn qua phải
    return 35;
};

export const isSameSender = (messages, m, i, userId) => {
    return (
        i < messages.length - 1 &&
        (messages[i + 1].sender.id !== m.sender.id ||
            messages[i + 1].sender.id === undefined) &&
        messages[i].sender.id !== userId
    );
};

export const isLastMessage = (messages, i, userId) => {
    return (
        i === messages.length - 1 &&
        messages[messages.length - 1].sender.id !== userId &&
        messages[messages.length - 1].sender.id
    );
};

export const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender.id === m.sender.id;
};

export const getSender = (loggedUser, users) => {
    return users[0]?.user?.id === loggedUser?.id ? users[1].user.firstName + " " + users[1].user.lastName : users[0].user.firstName + " " + users[0].user.lastName;
};

export const getSenderFull = (loggedUser, users) => {
    return users[0].id === loggedUser.id ? users[1] : users[0];
};
