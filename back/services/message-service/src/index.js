const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");
const messageSocket = require("./socket/messageSocket");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Message-Service connected to MongoDB"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/messages", messageRoutes);

// WebSocket
messageSocket(io);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () =>
  console.log(`Message-Service running on port ${PORT}`)
);
