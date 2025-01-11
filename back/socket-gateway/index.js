const express = require("express");
const axios = require("./config/axios");
const { Server } = require("socket.io");
const chatSocket = require("./sockets/chatSocket");
const http = require("http");

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