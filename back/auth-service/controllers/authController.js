const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");
const axios = require("../config/axios");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Notification = require("../models/notificationModel");

const userExists = async (username, email) => {
  const user = await User.findOne({ $or: [{ username }, { email }] });
  return user !== null;
};

const validateInput = (username, email) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/g;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g;

  return usernameRegex.test(username) && emailRegex.test(email);
};

exports.getCSRFToken = async (req, res) => {
  console.log("[INFO] - getCRSFToken");
  const token = req.csrfToken();
  res.json({ csrfToken: token });
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("[INFO] - loginUser - username : ", username);

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (user.mfaStatus === true) {
      const { mfa } = req.body;
      if (!mfa) {
        res.json({ success: false, message: "Insert MFA" });
      }
      try {
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
          token: mfa,
          window: 1,
        });

        if (verified) {
          console.log("MFA verified successfully");
        } else {
          console.log("Invalid MFA token");
          return res
            .status(400)
            .json({ success: false, message: "Invalid MFA token" });
        }
      } catch (err) {
        console.error(err);
        res
          .status(500)
          .json({ success: false, message: "Error verifying MFA" });
      }
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
  console.log("[INFO] - registerUser - username : ", username);

  let defaultRoomId = "67562a9100035c1096e6ba9d";
  rooms
    ? rooms
    : (rooms = [{ roomId: "67562a9100035c1096e6ba9d", status: "accepted" }]);

  if (!validateInput(username, email)) {
    return res
      .status(400)
      .json({ message: "Invalid username or email format" });
  }

  if (password != confirmedPassword) {
    console.log("Passwords don't match");
    return res
      .status(400)
      .json({ message: "Passwords don't match" })
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
      bio,
      password,
      rooms: [],
      avatar,
      banner,
    });
    console.log("User créé avec succès");
    const savedUser = await newUser.save();
    console.log("[SUCCESS] - registerUser - User registered successfully");

    const response = await axios.chatService.post(
      `/room/internal/addUser/${defaultRoomId}`,
      {
        roomId: defaultRoomId,
        userId: savedUser._id,
      }
    );
    console.log(response);
    res.status(201).json(savedUser);
  } catch (err) {
    console.log("[ERROR] - registerUser - ", err);
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
      console.log("Demande de requete POST pour l'user :", req.body.userId);
      isUserProfile = false;
      user = req.body;
    } else {
      console.log("Demande de requete GET");
      req.body.userId = user.userId;
      isUserProfile = true;
      user = req.user;
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
      userRooms.map(async (room) => {
        if (!room.roomId) {
          console.error("[ERROR] - getUserProfile - Room ID is undefined");
          return;
        }
        let roomInformations = [];
        try {
          roomInformations = await axios.chatService.get(
            `/room/${room.roomId}`
          );
          if (!isUserProfile && roomInformations.data.private) {
            return null;
          }
          if (!isUserProfile) {
            roomInformations.data.messages = undefined;
            roomInformations.data.category = undefined;
            roomInformations.data.private = undefined;
          }
        } catch (error) {
          console.error("[ERROR] - getUserProfile - ", error.message);
        }
        return { ...roomInformations.data, status: room.status };
      })
    );

    const filteredRooms = rooms.filter((room) => room !== null);
    console.log("[SUCCESS] - getUserProfile - All rooms informations fetched");

    for (const room of filteredRooms) {
      if (!room) {
        continue;
      }
      for (let i = 0; i < room.users.length; i++) {
        console.log();
        if (room.users[i].status === "pending") {
          room.users.splice(i, 1);
          i--;
          continue;
        }
        const user = await User.findById(room.users[i].userId).select(
          "username avatar"
        );
        room.users[i] = { ...user._doc, status: room.users[i].status };
      }
      if (room.private) {
        // Vérifie l'index de l'utilisateur qui n'a pas le nom de l'utilisateur db_user, et le mets en nom de room
        const userIndex = room.users.findIndex(
          (user) => user.username !== db_user.username
        );
        room.title = room.users[userIndex].username;
      }
    }

    // Get user friends informations
    const friends = await Promise.all(
      db_user.friends.map(async (friend) => {
        const friendData = await User.findById(friend.friendId).select(
          "username bio avatar"
        );
        return { ...friendData._doc, status: friend.status };
      })
    );

    res.status(200).json({
      message: isUserProfile
        ? "Ce profil est votre profil"
        : "Ce profil est le profil d'un autre utilisateur",
      user: {
        ...db_user._doc,
        friends,
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
  console.log("[INFO] Setting up MFA");
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
    user.mfaStatus = true;
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

exports.resetMFA = async (req, res) => {
  console.log("[INFO] Reseting MFA");
  const { username } = req.body;
  console.log(username);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.mfaSecret = null;
    user.mfaStatus = false;
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
  const { userId } = req.params;
  const { roomId, status } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vérifier si la room n'est pas déjà dans les rooms de l'utilisateur
    if (user.rooms.some((room) => room.roomId === roomId)) {
      return res.status(400).json({ message: "Room already in user's rooms" });
    }

    // Ajouter la room dans la liste des rooms de l'utilisateur avec le statut spécifié
    user.rooms.push({ roomId, status });
    await user.save();

    res
      .status(200)
      .json({ message: "Room added to user's rooms successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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

exports.updateUserProfile = async (req, res) => {
  console.log(
    `[INFO] Updating user's ${req.user.userId} profile with : ${req.body.email}`
  );
  const userId = req.user.userId;
  const email = req.body.email;

  if (userId) {
    console.log(email);
    try {
      const user = await User.updateOne(
        { _id: userId },
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
};

exports.getUserImages = async (req, res) => {
  try {
    console.log("[INFO] - getUserImages");
    let user;
    let isUserProfile;
    if (req.user) {
      user = req.user;
      if (req.body.userId) {
        console.log("Demande de requete POST");
        user = req.body;
        isUserProfile = false;
      } else {
        console.log("Demande de requete GET");
        user = req.user;
        // req.body.userId = user.userId;
        isUserProfile = true;
      }
    } else {
      user = req.body;
    }

    console.log(user.userId.userId);

    const db_user = await User.findById({ _id: user.userId }).select(
      "avatar banner"
    );
    console.log(db_user);

    if (!db_user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      avatar: db_user.avatar ? `${db_user.avatar}` : null,
      banner: db_user.banner ? `${db_user.banner}` : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFile = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../uploads", fileName);
  console.log("[INFO] - getFile - filePath : ", filePath);
  console.log(fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    res.sendFile(filePath);
  });
};

exports.getUserFriends = async (req, res) => {
  console.log("[INFO] - getUserFriends");
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).populate("friends");
    res.json(user.friends);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.addUserFriend = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;

  if (userId === friendId)
    return res
      .status(403)
      .json({ message: "You can't add yourself as a friend" });

  try {
    // Find the user and the friend
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    if (
      user.friends.find((friend) => friend.friendId.toString() === friendId)
    ) {
      const userFriend = user.friends.find(
        (friend) => friend.friendId.toString() === friendId
      );
      console.log("EURH", userFriend);
      if (userFriend.status === "pending") {
        return res.status(400).json({ message: "Friend request already sent" });
      }
      return res.status(400).json({ message: "Friend already added" });
    }

    // Add the friend to the user's friends list
    user.friends.push({
      friendId: friendId,
      status: "pending",
      requestBy: user._id,
    });
    await user.save();

    friend.friends.push({
      friendId: userId,
      status: "pending",
      requestBy: user._id,
    });
    await friend.save();

    res.status(200).json({ message: "Friend request sended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.acceptUserFriend = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;
  console.log("[INFO] - acceptUserFriend - userId : ", userId);

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      console.log("[ERROR] - acceptUserFriend - User or friend not found");
      return res.status(404).json({ message: "User or friend not found" });
    }

    user.friends.forEach((friend) => {
      if (friend.requestBy.toString() === userId) {
        console.log("Impossible");
        return res
          .status(400)
          .json({ message: "You can't accept your own request" });
      }
      if (friend.friendId.toString() === friendId) {
        console.log("Friend founded");
        friend.status = "accepted";
      }
    });

    user.friends.forEach((friend) => {
      if (friend.friendId.toString() === friendId) {
        console.log("Friend founded in user friends");
        friend.status = "accepted";
      }
    });
    await user.save();

    friend.friends.forEach((friend) => {
      console.log(friend);
      if (friend.friendId.toString() === userId) {
        friend.status = "accepted";
      } else {
        console.log("Friend not founded in friend friends");
      }
    });

    await friend.save();
    return res.status(200).json({ message: "Friend accepted" });
  } catch (error) {
    console.log("[ERROR] - acceptUserFriend - ", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.denyUserFriend = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    user.friends = user.friends.filter(
      (friend) => friend.friendId.toString() !== friendId
    );
    await user.save();

    friend.friends = friend.friends.filter(
      (friend) => friend.friendId.toString() !== userId
    );
    await friend.save();

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteUserFriend = async (req, res) => {
  const userId = req.user.userId;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    user.friends = user.friends.filter(
      (friend) => friend.friendId.toString() !== friendId
    );
    await user.save();

    friend.friends = friend.friends.filter(
      (friend) => friend.friendId.toString() !== userId
    );
    await friend.save();

    return res.status(200).json({ message: "Friend deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.handleRoomInvitation = async (req, res) => {
  const { roomId, userId, roomTitle, invitingUserId } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    console.log(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vérifier si l'utilisateur n'est pas déjà dans la room
    if (user.rooms.some((room) => room.roomId.toString() === roomId)) {
      return res.status(400).json({ message: "User already in the room" });
    }

    // Ajouter la room dans la liste des rooms de l'utilisateur avec le statut 'pending'
    user.rooms.push({ roomId, status: "pending" });
    await user.save();

    // Créer une notification pour l'utilisateur
    const notification = new Notification({
      title: "Room Invitation",
      message: `You have been invited to join the room: ${roomTitle}`,
      userId: userId,
      from: invitingUserId,
    });
    await notification.save();

    res.status(200).json({ message: "Invitation handled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.acceptRoomInvitation = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mettre à jour le statut de la room de l'utilisateur à 'accepted'
    const room = user.rooms.find((room) => room.roomId.toString() === roomId);
    if (room) {
      room.status = "accepted";
      await user.save();
    }

    res.status(200).json({ message: "Room invitation accepted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.declineRoomInvitation = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Supprimer la room de la liste des rooms de l'utilisateur
    user.rooms = user.rooms.filter((room) => room.roomId.toString() !== roomId);
    await user.save();

    res.status(200).json({ message: "Room invitation declined successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.leaveRoom = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Supprimer la room de la liste des rooms de l'utilisateur
    console.log(user.rooms);
    user.rooms = user.rooms.filter((room) => room.roomId.toString() !== roomId);
    await user.save();

    console.log(user.rooms);

    res.status(200).json({ message: "Left the room successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
