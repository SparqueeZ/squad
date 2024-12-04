require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const chatSocket = require("./sockets/chatSocket");
const roomRoutes = require("./routes/roomRoutes");
const dbConfig = require("./config/db");

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
app.use("/", chatRoutes);
app.use("/room", roomRoutes);

const PORT = process.env.PORT || 3003;

// Connecter MongoDB
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to MongoDB");

    // Démarrer WebSockets
    chatSocket(io);

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`Running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
