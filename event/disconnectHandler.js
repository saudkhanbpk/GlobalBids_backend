export const disconnectHandler = (socket, users) => {
  const userId = socket.decoded_token.id;
  socket.on("disconnect", () => {
    delete users[userId];
  });
};
