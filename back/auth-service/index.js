const express = require("express");
const app = express();
app.use(express.json());

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "test" && password === "password") {
    res.json({ token: "fake-jwt-token" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
