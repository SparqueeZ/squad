// api-gateway/index.js
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.get("/users", async (req, res) => {
  const response = await axios.get("http://user-service:3003/users");
  res.json(response.data);
});

app.get("/", async (req, res) => {
  const response = await axios.get("http://user-service:3003/");
  res.json(response.data);
});

app.get("/auth", async (req, res) => {
  const response = await axios.get("http://auth-service:3001/auth");
  res.json(response.data);
});

app.get("/chats", async (req, res) => {
  const response = await axios.get("http://chat-service:3002");
  res.json(response.data);
});

app.listen(3000, () => console.log("API Gateway running on port 3000"));
