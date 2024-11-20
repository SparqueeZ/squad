const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Routes vers les services
app.use("/auth", async (req, res) => {
  const { method, body } = req;
  try {
    const response = await axios({
      url: `http://auth-service:3001${req.url}`,
      method,
      data: body,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.use("/users", async (req, res) => {
  const { method, body } = req;
  try {
    const response = await axios({
      url: `http://user-service:3002${req.url}`,
      method,
      data: body,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.use("/chat", async (req, res) => {
  const { method, body } = req;
  try {
    const response = await axios({
      url: `http://chat-service:3003${req.url}`,
      method,
      data: body,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway listening on port ${PORT}`));
