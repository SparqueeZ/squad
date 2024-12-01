const express = require("express");
const mongoose = require("mongoose");
const dbConfig = require("./config/db");
const axios = require("./config/axios");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
const authRoutes = require("./routes/authRoutes");
const PORT = 3001;

app.use("/", authRoutes);

mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to MongoDB");

    // Démarrer le serveur
    app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
