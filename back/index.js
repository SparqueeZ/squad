const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dbConfig = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/messageModel");
const roomRoutes = require("./routes/roomRoutes");
const Room = require("./models/roomModel");
const userRoutes = require("./routes/userRoutes");
const userController = require("./controllers/userController");

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = socketIo(server, {
  cors: {
    origin: "http://172.16.80.211", // Permettre les requêtes de toutes les origines
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://172.16.80.211", // Permettre les requêtes de toutes les origines
    credentials: true, // Enable credentials
    methods: ["GET", "POST"],
  })
);

app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(dbConfig.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database connection error:", err));

io.on("connection", (socket) => {
  // console.log("New client connected");
  socket.join("general");

  socket.on("joinRoom", (room) => {
    // console.log("Joining room", room);
    socket.join(room);
    socket
      .to(room)
      .emit("message", `Utilisateur ${socket.id} a rejoint la room ${room}`);
  });

  socket.on("sendMessage", async (roomData, messageData) => {
    try {
      const newMessage = new Message(messageData);
      const savedMessage = await newMessage.save();
      io.to(roomData).emit("receiveMessage", savedMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("isTyping", async (roomData, userData) => {
    console.log("IsTyping", roomData, userData);
    io.to(roomData).emit("isTyping", userData);
  });
  socket.on("stoppedTyping", async (roomData, userData) => {
    console.log("stoppedTyping", roomData, userData);
    io.to(roomData).emit("stoppedTyping", userData);
  });
  socket.on("messageViewed", async (roomId, messageId, username) => {
    io.to(roomId).emit("messageViewed", messageId, username);
    userController.updateMessageViewsLogic(messageId, username);
  });

  socket.on("disconnect", () => {
    // console.log("Client disconnected");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
