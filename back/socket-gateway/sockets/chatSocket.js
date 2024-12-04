const axios = require("../config/axios");

module.exports = (io, socket) => {
  socket.on("joinRoom", (username, roomId) => {
    console.log(`[INFO] ${username} joined room ${roomId}`);
    socket.join(roomId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const response = await axios.apiGateway.post("/api/chat/", data);
      // console.log("Message saved:", response);
      // console.log("Message saved:", response.data);
      io.to(response.data.roomId).emit("receiveMessage", response.data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
};
