const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  console.log("Authenticating token");
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "jwtsecretdelamortquitue", (err, user) => {
    if (err) {
      console.log("Invalid token");
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    console.log("Token authenticated");
    next();
  });
};

module.exports = authenticateToken;
