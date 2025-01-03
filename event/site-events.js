import { Server } from "socket.io";
import socketioJwt from "socketio-jwt";
import { disconnectHandler } from "./disconnectHandler.js";

export const connectedUsers = {};
export const connectedRooms = {};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: true, methods: ["GET", "POST"] },
  });

  io.use(
    socketioJwt.authorize({
      secret: process.env.ACCESS_TOKEN_SECRET,
      handshake: true,
    })
  );

  io.on("connection", (socket) => {    
    const userId = socket.decoded_token._id;
    connectedUsers[userId] = socket.id;
    io.emit("user_status", { userId, status: "online" });
    socket.on("join_room", (data) => {
      const { roomId } = data;
      if (!connectedRooms[roomId]) {
        connectedRooms[roomId] = [];
      }
      if (!connectedRooms[roomId].includes(socket.id)) {
        connectedRooms[roomId].push(socket.id);
      }
      socket.join(roomId);
    });
    //===============
    disconnectHandler(socket, connectedUsers, connectedRooms, io);
  });
  return io;
};

export default initSocket;
