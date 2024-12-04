const express = require("express");
const axios = require("./config/axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost",
    credentials: true,
  })
);

const logMiddleware = (req, res, next) => {
  console.log(`API Gateway request: ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`API Gateway response status: ${res.statusCode}`);
  });
  next();
};

app.use(logMiddleware);

// Routes vers les services
app.use("/api/auth", async (req, res) => {
  const { method, body } = req;
  try {
    const response = await axios.authService({
      url: `${req.url}`,
      method,
      data: body,
    });

    // Forward cookies from auth service response to client
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      res.setHeader("set-cookie", setCookieHeader);
    }

    res.status(response.status).json(response.data);
    console.log(response.data);
  } catch (err) {
    console.log(err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.use("/api/user", async (req, res) => {
  const { method, body } = req;
  const token = req.cookies ? req.cookies.token : null;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const response = await axios.userService({
      url: `${req.url}`,
      method,
      data: body,
      headers: {
        Cookie: `token=${token}`,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.log(err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.use("/api/chat", async (req, res) => {
  const { method, body } = req;
  const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  try {
    const response = await axios.chatService({
      url: `${req.url}`,
      method,
      data: body,
      headers: {
        ...req.headers, // Copier tous les en-têtes reçus
        "X-Forwarded-For": userIp, // Ajouter/Remplacer l'en-tête X-Forwarded-For
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
