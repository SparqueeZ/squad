const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const chatSocket = require("./sockets/chatSocket");
// const anotherSocket = require("./sockets/anotherSocket"); // Importez d'autres sockets ici

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

io.on("connection", (socket) => {
  // Initialiser les sockets
  chatSocket(io, socket);
  // anotherSocket(io, socket); // Initialisez d'autres sockets ici

  socket.on("disconnect", () => {
    // console.log("Un client s'est déconnecté du Socket Gateway");
  });
});

const PORT = 3004;
server.listen(PORT, () =>
  console.log(`Socket Gateway running on port ${PORT}`)
);
