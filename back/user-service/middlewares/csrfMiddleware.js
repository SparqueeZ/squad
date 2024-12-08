const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel");

const verifyCsrfToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.warn("[WARN] No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "jwtsecretdelamortquitue", async (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    const username = user.username;
    const csrfToken = req.headers["x-csrf-token"];

    console.log("CSRF token", csrfToken);

    try {
      const storedToken = await Token.findOne({
        userId: username,
        token: csrfToken,
      });
      if (!storedToken) {
        console.error("[ERROR] Invalid CSRF token provided");
        return res.status(403).json({ message: "Invalid CSRF token" });
      }
      console.log("[INFO] CSRF Token authenticated successfully");
      next();
    } catch (error) {
      console.error("[ERROR] Error verifying CSRF token", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = verifyCsrfToken;
