const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");

const userExists = async (username, email) => {
  const user = await User.findOne({ $or: [{ username }, { email }] });
  return user !== null;
};

const validateInput = (username, email) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/g;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;

  return usernameRegex.test(username) && emailRegex.test(email);
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  console.log("[INFO] - loginUser - username : ", username);

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Génération du token JWT pour l'authentification
    const authToken = jwt.sign(
      {
        role: user.role,
        username: user.username,
        email: user.email,
        // rooms: user.rooms,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Génération d'un token CSRF unique
    const csrfToken = crypto.randomBytes(32).toString("hex");

    // Vérification si un user a déjà un token CSRF
    const existing = await Token.findOne({ userId: user.username });
    if (existing) {
      existing.token = csrfToken;
      await existing.save();
    } else {
      const token = new Token({ userId: user.username, token: csrfToken });
      await token.save();
    }

    // Stockage du token CSRF en base de données
    // const token = new Token({ userId: user.username, token: csrfToken });
    // await token.save();

    // Stocker les tokens dans des cookies sécurisés
    res.cookie("token", authToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.cookie("csrf_token", csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: "Strict",
    });

    res.json({
      message: "User logged in",
      data: {
        role: user.role,
        username: user.username,
        email: user.email,
        rooms: user.rooms,
      },
      csrfToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  console.log("[INFO] - logoutUser ");
  res.clearCookie("token");
  res.clearCookie("csrf_token");
  res.json({ message: "User logged out" });
};

exports.registerUser = [
  async (req, res) => {
    const { username, email, password, rooms } = req.body;
    rooms ? rooms : (rooms = ["673382c2f30357627ee996e4"]);

    if (!validateInput(username, email)) {
      return res
        .status(400)
        .json({ message: "Invalid username or email format" });
    }

    try {
      if (await userExists(username, email)) {
        return res.status(409).json({ message: "User already exists" });
      }

      const newUser = new User({ username, email, password, rooms });
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
];

exports.getAllUsers = async (req, res) => {
  console.log("Fetching all users");
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserRooms = async (req, res) => {
  console.log(`[INFO] Fetching user rooms...`);
  const user = req.user;
  try {
    const rooms = await Promise.all(
      user.rooms.map(async (roomId) => {
        const roomData = await getRoomInformationsById(roomId);
        return roomData;
      })
    );
    res.json(rooms);
    console.info(`[SUCCESS] User rooms fetched successfully`);
  } catch (err) {
    console.error(
      `[ERROR] Error fetching user ${req.params.userId} rooms`,
      err.message
    );
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserRooms = async (req, res) => {
  console.log(
    `[INFO] Updating user ${req.params.userId} rooms with room ${req.body.roomId}`
  );
  const userId = req.params.userId;
  if (req.body.roomId) {
    try {
      const user = await User.findById(userId);
      user.rooms.push(req.body.roomId);
      const savedUser = await user.save();
      res.json(savedUser);
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ error: err.message });
    }
  } else {
    console.error("[ERROR] Missing room ID");
    res.status(400).json({ error: "Missing room ID" });
  }
};
