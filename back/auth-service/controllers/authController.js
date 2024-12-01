const User = require("../models/userModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");
const axios = require("axios");

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

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    } else {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
    }
    const token = jwt.sign(
      {
        role: user.role,
        username: user.username,
        email: user.email,
        rooms: user.rooms,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

    res.json({ message: "User logged in" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  res.clearCookie("token");
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
