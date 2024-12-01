const User = require("../models/userModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");
const axios = require("../config/axios");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUsers = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "User logged out" });
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.profile = async (req, res) => {
  const user = req.user;
  try {
    const unreadMessages = await getUnreadMessagesCount(
      user.rooms,
      user.username
    );
    const rooms = user.rooms.map((roomId) => ({
      id: roomId,
      unreadMessages:
        unreadMessages.find((msg) => msg.id === roomId)?.count || 0,
      // Add lastMessage or other properties if needed
    }));
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      rooms,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFullProfile = async (req, res) => {
  const user = req.user;
  try {
    const unreadMessages = await getUnreadMessagesCount(
      user.rooms,
      user.username
    );
    const rooms = user.rooms.map((roomId) => ({
      id: roomId,
      unreadMessages:
        unreadMessages.unreadMessages.find((msg) => msg.id === roomId)?.count ||
        0,
    }));
    res.json({
      general: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      rooms,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.registerUser = async (req, res) => {
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
    const response = await axios.chatService.get(`/api/rooms/${roomId}`);
    return response.data;
  } catch (err) {
    throw new Error("Error fetching room data");
  }
}

exports.getUserRooms = async (req, res) => {
  const user = req.user;
  try {
    const rooms = await Promise.all(
      user.rooms.map(async (roomId) => {
        const roomData = await getRoomById(roomId);
        return roomData;
      })
    );
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMessageViews = async (req, res) => {
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
  try {
    const response = await axios.chatService.post("/api/chat/internal/unread", {
      roomIds,
      username,
    });
    console.log("response", response.data);
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error("Error fetching unread messages count");
  }
}
