require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const roomRoutes = require("./routes/roomRoutes");
const dbConfig = require("./config/db");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cookieParser());
// Middleware pour injecter io dans req
app.use((req, res, next) => {
  req.io = io; // Injecte l'instance de Socket.IO
  next();
});

// Routes API REST
app.use("/", chatRoutes);
app.use("/room", roomRoutes);

const PORT = process.env.PORT || 3003;

// Connecter MongoDB
mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to MongoDB");

    // Démarrer le serveur
    server.listen(PORT, () => {
      console.log(`Running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
