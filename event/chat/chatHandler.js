import MessageModel from "../../model/chat.message.model.js";
import RoomModel from "../../model/chat.room.model.js";

export const chatHandler = async (socket, users, io) => {
  const userId = socket.decoded_token.id;

  socket.on("chat", async ({ receiverId, message, timestamp, timeZone }) => {
    if (!receiverId) {
      return socket.emit("error", { message: "receiverId is required" });
    }

    try {
      let room = await RoomModel.findOne({
        users: { $all: [userId, receiverId] },
      });

      if (!room) {
        room = new RoomModel({
          users: [userId, receiverId],
        });
        await room.save();
      }

      const messageData = {
        roomId: room._id,
        senderId: userId,
        receiverId,
        message,
        timestamp,
        timeZone,
        status: "delivered",
      };

      const newMessage = new MessageModel(messageData);
      await newMessage.save();

      room.last_message = newMessage._id;
      await room.save();

      if (users[receiverId]) {
        io.to(users[receiverId]).emit("message", messageData);
      } else {
        socket.emit("error", { message: `User ${receiverId} not connected` });
      }
    } catch (error) {
      console.log(error);

      socket.emit("error", { message: "Message sending failed" });
    }
  });
};
