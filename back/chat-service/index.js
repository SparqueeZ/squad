require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const chatSocket = require("./sockets/chatSocket");
const dbConfig = require("./config/db");
const Message = require("./models/messageModel");

const app = express();
const server = http.createServer(app); // Serveur HTTP pour Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Autorise toutes les origines (adapter en prod)
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// Routes API REST
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 3003;

// Connecter MongoDB
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Démarrer WebSockets
    chatSocket(io);

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`Chat-service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
