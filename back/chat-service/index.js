// user-service/index.js
const express = require("express");
const app = express();

app.use(express.json());

const users = [{ id: 1, name: "John Doe" }];

app.get("/users", (req, res) => {
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("User Service test");
});

app.listen(3002, () => console.log("User Service running on port 3002"));
