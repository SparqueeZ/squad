const axios = require("../config/axios");

module.exports = (io, socket) => {
  // Quand un message est reçu du client, le transférer au chat-service
  socket.on("sendMessage", (data) => {
    console.log("Message reçu :", data);
    axios.apiGateway
      .post("/api/chat/", data)
      .then((response) => {
        socket.emit("newMessage", response.data);
      })
      .catch((err) => {
        console.error("Error forwarding message:", err.message);
      });
  });

  socket.on("joinRoom", (roomId) => {
    console.log("User joined room", roomId);
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
