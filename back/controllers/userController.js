const User = require("../models/userModel");
const Room = require("../models/roomModel");
const Message = require("../models/messageModel");
const JWT_SECRET = "jwtsecretdelamortquitue";
const jwt = require("jsonwebtoken");

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
    const unreadMessages = await Message.countDocuments({
      roomId: { $in: user.rooms },
      viewedBy: { $ne: user.username },
    });
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      unreadMessages,
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

exports.getUserRooms = async (req, res) => {
  const user = req.user;
  try {
    const rooms = await Promise.all(
      user.rooms.map(async (roomId) => {
        // const rooms = roomController.getRoomById(roomId);
        const room = await Room.findById(roomId);
        const lastMessage = await Message.findOne({
          roomId: roomId,
        }).sort({ timestamp: -1 });
        return { room, lastMessage };
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
    const messages = await Message.find({
      _id: messageId,
      viewedBy: { $ne: username },
    });
    messages.forEach(async (message) => {
      message.viewedBy.push(username);
      await message.save();
    });
    return messages;
  } catch (err) {
    return err;
  }
}
exports.updateMessageViewsLogic = updateMessageViewsLogic;
