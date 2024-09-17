export const disconnectHandler = (socket, users, io) => {
  const userId = socket.decoded_token.id;
  socket.on("disconnect", () => {
    delete users[userId];
    io.emit("user_status", { userId, status: "offline" });
  });
};
