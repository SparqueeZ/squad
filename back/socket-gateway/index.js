const express = require("express");
const axios = require("axios");
const { Server } = require("socket.io");
const chatSocket = require("./sockets/chatSocket");
const http = require("http");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware pour injecter io dans req
app.use((req, res, next) => {
  req.io = io; // Injecte l'instance de Socket.IO
  next();
});

// Démarrer WebSockets
chatSocket(io);

server.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
