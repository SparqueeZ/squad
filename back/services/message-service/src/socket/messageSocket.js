module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected via WebSocket");

    socket.on("sendMessage", (message) => {
      io.emit("receiveMessage", message); // Broadcast message
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
