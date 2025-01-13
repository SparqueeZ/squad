const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Activer la confiance dans les proxys (nécessaire si derrière un proxy comme Nginx)
app.set("trust proxy", 1);

// Configuration du rate limiting pour limiter le nombre de requêtes par IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Période de 15 minutes
  max: 10000, // Maximum 10 000 requêtes par période
  message: "Too many requests from this IP, please try again later.",
});

// Application du middleware de rate limiting
app.use(limiter);

// Configuration de CORS pour permettre uniquement les requêtes depuis "http://localhost"
// Cela garantit que seules les requêtes provenant de cette origine sont acceptées.
app.use(
  cors({
    origin: "http://10.8.0.2", // Autoriser cette origine spécifique
    credentials: true, // Permettre l'envoi des cookies et des headers d'autorisation
  })
);

// Middleware proxy pour rediriger les requêtes vers les différents microservices
// Microservice d'authentification
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3001", // Microservice auth
    changeOrigin: true, // Change l'origine pour correspondre au backend
    pathRewrite: {
      "^/api/auth/uploads": "/uploads", // Redirige les requêtes vers `/api/auth/uploads` vers `/uploads`
    },
  })
);

// Microservice utilisateur
app.use(
  "/api/user",
  createProxyMiddleware({
    target: "http://localhost:3002", // Microservice user
    changeOrigin: true,
  })
);

// Microservice de chat
app.use(
  "/api/chat",
  createProxyMiddleware({
    target: "http://localhost:3003", // Microservice chat
    changeOrigin: true,
  })
);

// // Servir les fichiers statiques (ex. : uploads) depuis le service d'authentification
// app.use(
//   "/uploads",
//   createProxyMiddleware({
//     target: "http://localhost:3001", // Les fichiers statiques sont servis par le service auth
//     changeOrigin: true,
//   })
// );

// Parse les requêtes JSON
app.use(express.json());

// Exemple de validation Captcha (commenté, à activer si nécessaire)
/*
app.post("/api/validate-captcha", async (req, res) => {
  const secret = process.env.CAPTCHA_SECRET_KEY;
  const token = req.body.token;

  try {
    // Envoi de la requête à Cloudflare Turnstile pour valider le captcha
    const validateCaptchaResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
          token
        )}`,
      }
    );

    const validateCaptchaResponseBody = await validateCaptchaResponse.json();

    // Vérification de la réponse
    if (validateCaptchaResponseBody.success) {
      res.status(200).send({ success: true });
    } else {
      res.status(403).send({ success: false });
    }
  } catch (error) {
    console.error("Erreur lors de la validation du captcha :", error);
    res.status(500).send({ success: false, error: "Internal server error" });
  }
});
*/

// Lancer le serveur API Gateway sur le port 3000
app.listen(3000, () => {
  console.log("API Gateway is running on http://localhost:3000");
});
