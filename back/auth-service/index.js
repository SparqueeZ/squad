const express = require("express");
const mongoose = require("mongoose");
const dbConfig = require("./config/db");
const axios = require("./config/axios");
const cookieParser = require("cookie-parser");
const path = require("path");
const csurf = require("csurf");
const dotenv = require("dotenv").config();

const csrfProtection = csurf({ cookie: true });

const session = require("express-session");
const app = express();

// Configurer le middleware session
app.use(
  session({
    secret: process.env.CSRF_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true }, // `secure: true` nécessite HTTPS
  })
);

// Configurer le cookie parser
app.use(cookieParser());

// Configurer le middleware csurf
const csrfMiddleware = csurf({
  cookie: {
    httpOnly: true,
    secure: false, // Activez uniquement si vous utilisez HTTPS
    sameSite: "strict", // Protection supplémentaire contre les attaques CSRF
  },
});

// Appliquez le middleware CSRF à toutes les routes
// app.use(csrfMiddleware);

app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    // Erreur CSRF détectée
    res.status(403).json({ error: "Token CSRF non valide" });
  } else {
    next(err);
  }
});
const authRoutes = require("./routes/authRoutes");
const PORT = 3001;

app.use("/", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to MongoDB");

    // Démarrer le serveur
    app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
