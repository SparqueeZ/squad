const User = require("../models/userModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");
const axios = require("../config/axios");

exports.getAllUsers = async (req, res) => {
  console.log("Fetching all users");
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUsers = async (req, res) => {
  console.log("Creating new user");
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  console.log("User login attempt");
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
    const token = jwt.sign(JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

    res.json({ message: "User logged in" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  console.log("User logout");
  res.clearCookie("token");
  res.json({ message: "User logged out" });
};

exports.getProfile = async (req, res) => {
  console.log("Fetching user profile");
  res.json(req.user);
};

exports.getFullProfile = async (req, res) => {
  console.log("[INFO] Fetching full user profile");
  const user = req.user;
  try {
    const databaseUser = await User.findOne({
      username: user.username,
      email: user.email,
    });
    const databaseUserRooms = databaseUser.rooms;
    const unreadMessages = await getUnreadMessagesCount(
      databaseUserRooms,
      user.username
    );
    const rooms = await Promise.all(
      databaseUserRooms.map(async (roomId) => {
        if (!roomId) {
          console.error("[ERROR] Room ID is undefined");
          return;
        }
        const roomInformations = await getRoomInformationsById(roomId);
        if (!roomInformations) {
          console.error(
            `[ERROR] Room ${roomId} data is undefined, deleting room for user ${user.username}`
          );
          const userAimed = await User.findOne({
            username: user.username,
            email: user.email,
          });
          const roomToDeleteIndex = userAimed.rooms.indexOf(roomId);
          userAimed.rooms.splice(roomToDeleteIndex, 1);
          databaseUserRooms.splice(roomToDeleteIndex, 1);
          user.rooms = userAimed.rooms;
          if (await userAimed.save()) {
            console.log(
              `[SUCCESS] Room ${roomId}deleted successfully deleted from user ${user.username}`
            );
            return null;
          } else {
            console.error("[ERROR] Room deletion failed");
          }
        }
        return {
          data: roomInformations ? roomInformations : {},
          unreadMessages:
            unreadMessages.unreadMessages.find((msg) => msg.id === roomId)
              ?.count || 0,
          lastMessages: (await getLastMessages(roomId)) || [],
        };
      })
    );
    const filteredRooms = rooms.filter((room) => room !== null);

    res.json({
      general: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      rooms: filteredRooms, // Use the filtered rooms array
    });

    console.log("[INFO] Full profile sent");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

async function getLastMessages(roomId) {
  console.log("[INFO] Fetching last messages for room", roomId.toString());
  try {
    const response = await axios.chatService.get(
      `http://localhost:3003/internal/last/${roomId}`
    );
    // console.log("response", response.data, roomId);
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

exports.registerUser = async (req, res) => {
  console.log("Registering new user");
  const { username, email, password, rooms } = req.body;
  rooms ? rooms : (rooms = ["673382c2f30357627ee996e4"]);

  try {
    const newUser = new User({ username, email, password, rooms });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

async function getRoomById(roomId) {
  try {
    const response = await axios.chatService.get(`/${roomId}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
}

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

exports.updateMessageViews = async (req, res) => {
  console.log("Updating message views");
  const user = req.user;
  const { messageId } = req.body;
  try {
    const messages = await updateMessageViewsLogic(messageId, user.username);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function updateMessageViewsLogic(messageId, username) {
  try {
    const messages = await getMessageById(messageId);
    const updatedMessages = messages.filter(
      (message) => !message.viewedBy.includes(username)
    );
    for (const message of updatedMessages) {
      message.viewedBy.push(username);
      await saveMessage(message);
    }
    return updatedMessages;
  } catch (err) {
    return err;
  }
}

async function getMessageById(messageId) {
  try {
    const response = await axios.chatService.get(
      `/messages/internal/findById?id=${messageId}`
    );
    return response.data;
  } catch (err) {
    throw new Error("Error fetching message data");
  }
}

async function saveMessage(message) {
  try {
    await axios.chatService.post("/messages/internal/save", message);
  } catch (err) {
    throw new Error("Error saving message data");
  }
}

exports.updateMessageViewsLogic = updateMessageViewsLogic;

async function getUnreadMessagesCount(roomIds, username) {
  console.log(
    "[INFO] Fetching unread messages count for rooms",
    JSON.stringify(roomIds)
  );
  try {
    const response = await axios.chatService.post(
      "http://localhost:3003/internal/unread",
      {
        roomIds,
        username,
      }
    );
    console.log("[SUCCESS] Unread messages count fetched successfully");
    return response.data;
  } catch (err) {
    console.error(
      "[ERROR] Error fetching unread messages count :",
      err.message
    );
  }
}

async function getRoomInformationsById(roomId) {
  console.log("[INFO] Fetching room data for room", JSON.stringify(roomId));
  if (!roomId) {
    console.error("[ERROR] Room ID is undefined");
    return;
  }
  try {
    const response = await axios.chatService.get(`/room/internal/${roomId}`);
    console.log("[INFO] Room data fetched successfully");
    return response.data;
  } catch (err) {
    console.error("[ERROR] Error fetching room data :", err.message);
  }
}

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
