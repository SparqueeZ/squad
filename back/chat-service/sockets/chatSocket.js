const Message = require("../models/messageModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`[INFO] New client connected: ${socket.id}`);
    // Événement pour rejoindre une salle
    socket.on("joinRoom", (username, roomId) => {
      console.log(`[INFO] ${username} joined room ${roomId}`);
      socket.join(roomId);
    });

    // Événement pour recevoir un message
    socket.on("sendMessage", async (data) => {
      console.log(data);
      try {
        // Sauvegarder le message dans MongoDB
        const newMessage = new Message(data.message);
        const savedMessage = await newMessage.save();

        // Émettre le message à tous les clients de la salle
        io.to(data.message.roomId).emit("receiveMessage", savedMessage);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    // Déconnexion du client
    socket.on("disconnect", () => {
      // console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
