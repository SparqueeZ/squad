const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// MiddleWare pour limiter le nombre de requêtes par IP
// 100 requêtes par IP toutes les 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Utilisation du CORS pour autoriser les requêtes depuis le front-end (developpement pour l'instant)
app.use(
  cors({
    origin: "http://localhost",
    credentials: true,
  })
);

// Proxy vers le microservice utilisateur
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
  })
);

// Proxy vers le microservice utilisateur
app.use(
  "/api/user",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
  })
);

// Proxy vers le microservice chat
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
  })
);

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
    ws: true,
  })
);

app.use(express.json());

app.post("/api/validate-captcha", async (req, res) => {
  const secret = process.env.CAPTCHA_SECRET_KEY;
  const token = req.body.token;

  console.log("Captcha token : " + token);

  const validateCaptchaResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
        token
      )}`,
    }
  );

  console.log(
    "Validate captcha status code : " + validateCaptchaResponse.status
  );
  const validateCaptchaResponseBody = await validateCaptchaResponse.json();
  console.log(
    "Validate captcha response : " + JSON.stringify(validateCaptchaResponseBody)
  );

  if (validateCaptchaResponseBody.success) {
    res.status(200).send({ success: true });
  } else {
    res.status(403).send({ success: false });
  }
});

// Démarrer le serveur API Gateway
app.listen(3000, () => {
  console.log("API Gateway is running on http://localhost:3000");
});
