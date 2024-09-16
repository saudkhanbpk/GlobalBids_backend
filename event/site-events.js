import { Server } from "socket.io";
import socketioJwt from "socketio-jwt";
import { chatHandler } from "./chat/chatHandler.js";
import { disconnectHandler } from "./disconnectHandler.js";


const users = {};

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
    users[userId] = socket.id;

    // Handle different events
    chatHandler(socket, users, io);
    disconnectHandler(socket, users);
  });
};

export default initSocket;
