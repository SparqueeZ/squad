const axios = require("axios");
// const axios = require("../config/axios");

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
      try {
        // Sauvegarder le message dans MongoDB
        //const newMessage = new Message(data.message);
        //const savedMessage = await newMessage.save();
        console.log("[ALERT] - Enregistrement en BDD");

        if (data.type === "file") {
        }

        // Faire une requete API pour enregistrer le message
        let response;
        try {
          response = await axios.post(
            "http://localhost:3003/internal/messages/save",
            data
          );
          // Émettre uniquement les données nécessaires
          io.to(data.message.roomId).emit("receiveMessage", response.data);
        } catch (err) {
          console.error("Error saving message:", err);
        }
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("fileUploaded", async (data) => {
      try {
        console.log("[ALERT] - Enregistrement d'un fichier en BDD");
        console.log(data.response.data);

        io.to(data.response.data.roomId).emit(
          "receiveMessage",
          data.response.data
        );
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
