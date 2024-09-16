export const chatHandler = (socket, users, io) => {
  const userId = socket.decoded_token.id;
  socket.on("chat", ({ receiverId, message, timestamp, timeZone }) => {
    if (!receiverId) {
      return socket.emit("error", { message: "receiverId is required" });
    }

    const messageData = {
      senderId: userId,
      receiverId,
      message,
      timestamp,
      timeZone,
      status: "delivered",
    };

    if (users[receiverId]) {
      io.to(users[receiverId]).emit("message", messageData);
    } else {
      socket.emit("error", { message: `User ${receiverId} not connected` });
    }
  });
};
