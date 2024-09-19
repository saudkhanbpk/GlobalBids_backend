export const chatHandler = async (socket, users, io) => {
  socket.on(
    "chat",
    async ({
      roomId,
      senderId,
      receiverId,
      message,
      timestamp,
      timeZone,
      newRoom,
    }) => {
      if (!receiverId) {
        return socket.emit("error", { message: "receiverId is required" });
      }

      try {
        const messageData = {
          newRoom: newRoom || undefined,
          roomId,
          senderId,
          receiverId,
          message,
          timestamp,
          timeZone,
        };

        if (receiverId) {
          io.to(users[receiverId]).emit("message", messageData);
        } else {
          socket.emit("error", { message: `User ${receiverId} not connected` });
        }
      } catch (error) {
        socket.emit("error", { message: "Message sending failed" });
      }
    }
  );
};
