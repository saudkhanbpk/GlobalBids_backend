import { Server } from "socket.io";
import socketioJwt from "socketio-jwt";
import { chatHandler } from "./chat/chatHandler.js";
import { disconnectHandler } from "./disconnectHandler.js";

export const connectedUsers = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: true, methods: ["GET", "POST"] },
  });

  io.use(
    socketioJwt.authorize({
      secret: process.env.JWT_SECRET,
      handshake: true,
    })
  );

  io.on("connection", (socket) => {
    const userId = socket.decoded_token.id;
    connectedUsers[userId] = socket.id;
    io.emit("user_status", { userId, status: "online" });

    // Handle different events
    chatHandler(socket, connectedUsers, io);
    disconnectHandler(socket, connectedUsers, io);
  });
};

export default initSocket;
