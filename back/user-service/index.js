const express = require("express");
const mongoose = require("mongoose");
const dbConfig = require("./config/db");
const axios = require("./config/axios");
const cookieParser = require("cookie-parser");
const logMiddleware = require("./middlewares/logMiddleware");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(logMiddleware);

const userRoutes = require("./routes/userRoutes");
const PORT = 3002;

app.use("/", userRoutes);

mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to MongoDB");

    // axios.chatService
    //   .get("/api/chat")
    //   .then((response) => {
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching data:", error);
    //   });

    // Démarrer le serveur
    app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
