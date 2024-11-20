// auth-service/index.js
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Validation simulée
  if (username === "user" && password === "pass") {
    const token = jwt.sign({ username }, "secret", { expiresIn: "1h" });
    return res.json({ token });
  }
  res.status(401).send("Invalid credentials");
});

app.get("/auth", (req, res) => {
  res.send("Auth Service");
});

app.listen(3001, () => console.log("Auth Service running on port 3001"));
