const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.warn("[WARN] No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "jwtsecretdelamortquitue", (err, user) => {
    if (err) {
      console.error("[ERROR] Invalid token provided");
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    console.log("[INFO] Token authenticated successfully");
    next();
  });
};

module.exports = authenticateToken;
