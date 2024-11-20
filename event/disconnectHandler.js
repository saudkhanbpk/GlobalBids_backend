// export const disconnectHandler = (socket, users, io) => {
//   const userId = socket.decoded_token.id;
//   socket.on("disconnect", () => {
//     delete users[userId];
//     io.emit("user_status", { userId, status: "offline" });
//   });
// };


export const disconnectHandler = (socket, users, connectedRooms, io) => {
  const userId = socket.decoded_token.id;

  socket.on("disconnect", () => {
    delete users[userId];
    for (const roomId in connectedRooms) {
      connectedRooms[roomId] = connectedRooms[roomId].filter(
        (socketId) => socketId !== socket.id
      );
      if (connectedRooms[roomId].length === 0) {
        delete connectedRooms[roomId];
      }
    }
    io.emit("user_status", { userId, status: "offline" });
  });

  socket.on("leave_room", ({ roomId }) => {
    if (connectedRooms[roomId]) {
      connectedRooms[roomId] = connectedRooms[roomId].filter(
        (socketId) => socketId !== socket.id
      );
      if (connectedRooms[roomId].length === 0) {
        delete connectedRooms[roomId];
      }
    }
    socket.leave(roomId);
    io.to(roomId).emit("room_update", {
      roomId,
      userId,
      status: "left",
    });
  });
};
