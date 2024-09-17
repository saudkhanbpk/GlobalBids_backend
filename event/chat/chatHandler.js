import MessageModel from "../../model/chat.message.model.js";
import RoomModel from "../../model/chat.room.model.js";

export const chatHandler = async (socket, users, io) => {
  const userId = socket.decoded_token.id;

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
        console.log(error);
        socket.emit("error", { message: "Message sending failed" });
      }
    }
  );
};
