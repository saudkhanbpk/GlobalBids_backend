import { Server } from "socket.io";
import socketioJwt from "socketio-jwt";

const users = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(
    socketioJwt.authorize({
      secret: process.env.JWT_SECRET,
      handshake: true,
    })
  );

  io.on("connection", (socket) => {
    const userId = socket.decoded_token.id;
    users[userId] = socket.id;

    socket.on("chat", ({ receiverId, message, timestamp, timeZone }) => {
      try {
        if (!receiverId) {
          socket.emit("error", {
            message: "receiverId is required to send a message",
          });
          return;
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
          socket.emit("error", {
            message: `User ${receiverId} is not connected`,
          });
          console.log(
            `User ${receiverId} is not connected, message not delivered`
          );
        }
      } catch (error) {
        socket.emit("error", { message: "Message sending failed" });
      }
    });
    socket.on("disconnect", () => {
      delete users[userId];
    });
  });
};

export default initSocket;
