const express = require("express");
const app = express();
app.use(express.json());

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

app.get("/", (req, res) => {
  res.json(users);
});

app.get("/:id", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ error: "User not found" });
});

const PORT = 3002;
app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
