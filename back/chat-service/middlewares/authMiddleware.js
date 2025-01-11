const axios = require("../config/axios");

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const response = await axios.authService.post("/internal/user/data", {
      token,
    });

    if (response.status === 200) {
      req.user = response.data.user;
      next();
    } else {
      res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = authenticateToken;
