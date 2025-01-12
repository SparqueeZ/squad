const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");
const axios = require("../config/axios");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const multer = require("multer");

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

    const authToken = jwt.sign(
      {
        userId: user._id,
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

    console.log("[SUCCESS] - loginUser - User logged in");
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
    console.error("[ERROR] - loginUser - ", err);
    res.status(500).json({ error: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  console.log("[INFO] - logoutUser ");
  res.clearCookie("token");
  res.clearCookie("csrf_token");
  res.json({ message: "User logged out" });
};

exports.registerUser = async (req, res) => {
  let { username, email, password, rooms } = req.body;
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

    const avatar = req.files.avatar ? req.files.avatar[0].filename : "";
    const banner = req.files.banner ? req.files.banner[0].filename : "";

    const newUser = new User({
      username,
      email,
      password,
      rooms,
      avatar,
      banner,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  console.log(`[INFO] - getUserProfile - username : ${req.user.userId}`);
  let user;
  let isUserProfile = false;

  if (req.user) {
    user = req.user;
    if (req.body.userId) {
      console.log("Demande de requete POST");
      isUserProfile = false;
    } else {
      console.log("Demande de requete GET");
      req.body.userId = user.userId;
      isUserProfile = true;
    }
  } else {
    user = req.body;
  }

  try {
    const select = isUserProfile
      ? "-password -mfaSecret -__v"
      : "-password -mfaSecret -email -role -__v";

    const db_user = await User.findOne({ _id: user.userId }).select(select);
    console.log(
      "[SUCCESS] - getUserProfile - User profile fetched successfully"
    );
    // Récupérer les informations des rooms
    const userRooms = db_user.rooms;

    console.log("[INFO] - getUserProfile - Fetching rooms informations");

    const rooms = await Promise.all(
      userRooms.map(async (roomId) => {
        if (!roomId) {
          console.error("[ERROR] - getUserProfile - Room ID is undefined");
          return;
        }
        let roomInformations = [];
        try {
          roomInformations = await axios.chatService.get(`/room/${roomId}`);
          if (!isUserProfile && roomInformations.data.private) {
            return null; // Skip private rooms if not the user's profile
          }
          if (!isUserProfile) {
            roomInformations.data.messages = undefined;
            roomInformations.data.category = undefined;
            roomInformations.data.private = undefined;
          }
        } catch (error) {
          console.error("[ERROR] - getUserProfile - ", error.message);
        }
        return roomInformations.data;
      })
    );

    const filteredRooms = rooms.filter((room) => room !== null);
    console.log(filteredRooms);
    console.log("[SUCCESS] - getUserProfile - All rooms informations fetched");

    for (const room of filteredRooms) {
      if (!room) {
        continue;
      }
      for (let i = 0; i < room.users.length; i++) {
        const user = await User.findById(room.users[i]).select("username");
        room.users[i] = user;
      }
      if (room.private) {
        // Vérifie si il y a uniquement 2 utilisateurs dans la room
        if (room.users.length !== 2) {
          console.error(
            `[ERROR] - getUserProfile - Private room ${room._id} has more than 2 users`
          );
          return res.status(400).json({
            error: `Private room ${room._id} has more than 2 users`,
          });
        }
        // Vérifie l'index de l'utilisateur qui n'a pas le nom de l'utilisateur db_user, et le mets en nom de room
        const userIndex = room.users.findIndex(
          (user) => user.username !== db_user.username
        );
        room.title = room.users[userIndex].username;
      }
    }

    res.status(200).json({
      message: req.body.userId
        ? "Ce profil est le profil d'un autre utilisateur"
        : "Ce profil est votre profil",
      user: {
        ...db_user._doc,
        rooms: filteredRooms,
      },
    });
    console.log(
      "[SUCCESS] - getUserProfile - User profile sended successfully"
    );
  } catch (err) {
    console.log("[ERROR] - getUserProfile - ", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.setupMFA = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: "MFA is already set up for this user",
      });
    }

    const secret = speakeasy.generateSecret({
      name: `Squad (${user.email})`,
    });

    user.mfaSecret = secret.base32;
    await user.save();

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      message: "MFA setup initiated",
      qrCode,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error setting up MFA" });
  }
};

exports.verifyMFA = async (req, res) => {
  try {
    const { username, token } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: "MFA is not set up for this user",
      });
    }

    // Vérifier le code TOTP
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (verified) {
      res.json({ success: true, message: "MFA verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid MFA token" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error verifying MFA" });
  }
};

exports.resetMFA = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.mfaSecret = null;
    await user.save();

    res.json({ success: true, message: "MFA reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error resetting MFA" });
  }
};

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

exports.updateMessageViews = async (req, res) => {
  console.log("[INFO] - updateMessageViews");
  const user = req.user;
  const { messageId } = req.body;

  // Chercher le username en fonction du userId
  const username = await User.findById(user._id).select("username");

  // Envoyer une requete au chat-service pour mettre à jour les messages vus
  try {
    const response = await axios.chatService.post(`/message/views`, {
      messageId,
      username,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.authenticateToken = (req, res) => {
  const token = req.body.token;
  console.log("[INFO] - authenticateToken ");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, "jwtsecretdelamortquitue", (err, user) => {
    if (err) {
      console.error("[ERROR] - authenticateToken - ", err);
      return res.status(403).json({ apiMessage: "Invalid token" });
    }
    req.user = user;
    console.log("[SUCCESS] - authenticateToken - Token sended successfully");
    res.status(200).json({ user: user });
  });
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

exports.updateUserProfile = async (req, res) => {
  console.log(`[INFO] Updating user's ${req.user.userId} profile with : ${req.body.email}`);
  const userId = req.user.userId;
  const email = req.body.email;
  
  if (userId) {
    console.log(email);
    try {
      const user = await User.updateOne(
        {_id: userId},
        { $set: { email: email } }
      );
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ error: err.message });
    }
  } else {
    console.error("[ERROR] missing user Id");
  }
}

exports.getUserImages = async (req, res) => {
  try {
    console.log("[INFO] - getUserImages");
    const user = await User.findById(req.user.userId).select("avatar banner");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const baseUrl = "http://localhost:3000"; // Change this to your API gateway URL
    res.json({
      avatar: user.avatar ? `${baseUrl}/uploads/${user.avatar}` : null,
      banner: user.banner ? `${baseUrl}/uploads/${user.banner}` : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
