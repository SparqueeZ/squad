const Message = require("../models/messageModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Événement pour rejoindre une salle
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);
    });

    // Événement pour recevoir un message
    socket.on("sendMessage", async (data) => {
      try {
        // Sauvegarder le message dans MongoDB
        const newMessage = new Message(data);
        const savedMessage = await newMessage.save();

        // Émettre le message à tous les clients de la salle
        io.to(data.roomId).emit("newMessage", savedMessage);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    // Déconnexion du client
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
