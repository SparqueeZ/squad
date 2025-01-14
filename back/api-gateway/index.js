const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Utilisation de CORS
app.use(
  cors({
    origin: "https://sparqueez.org",
    credentials: true,
  })
);

// Proxy vers différents microservices
app.use(
  "/api/auth",
  createProxyMiddleware({ target: "http://localhost:3001", changeOrigin: true })
);

app.use(
  "/api/user",
  createProxyMiddleware({ target: "http://localhost:3002", changeOrigin: true })
);

app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
  })
);

// Servir les fichiers statiques depuis le service d'authentification
app.use(
  "/uploads",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
  })
);

app.use(express.json());

// Validation Captcha
// app.post("/api/validate-captcha", async (req, res) => {
//   const secret = process.env.CAPTCHA_SECRET_KEY;
//   const token = req.body.token;
//   console.log(secret, token);

//   const validateCaptchaResponse = await fetch(
//     "https://challenges.cloudflare.com/turnstile/v0/siteverify",
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
//         token
//       )}`,
//     }
//   );

//   const validateCaptchaResponseBody = await validateCaptchaResponse.json();
//   console.log(validateCaptchaResponseBody);

//   if (validateCaptchaResponseBody.success) {
//     res.status(200).send({ success: true });
//   } else {
//     res.status(403).send({ success: false });
//   }
// });

// Démarrer le serveur HTTP (non sécurisé)
app.listen(3000, () => {
  console.log("API Gateway is running on http://localhost:3000");
});
