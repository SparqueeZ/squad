const Message = require("../models/messageModel");
const { getReadableTimestampParis } = require("../utils/date");

exports.getAllMessages = async (req, res) => {
  console.log("[INFO] Getting all messages");
  const timestamp = getReadableTimestampParis();

  const userIp = req.headers["x-forwarded-for"] || req.ip;

  console.log(`${timestamp} GET request: getAllMessages from IP: ${userIp}`);
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessagesByRoomId = async (req, res) => {
  console.log("[INFO] Getting all messages for room", req.params.roomId);
  try {
    const messages = await Message.find({ roomId: req.params.roomId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLastMessagesByRoomId = async (req, res) => {
  console.log("[INFO] Getting last messages for room", req.params.roomId);
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({
        timestamp: -1,
      })
      .limit(10);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMessage = async (req, res) => {
  console.log("[INFO] Creating new message");
  try {
    console.log(req.body);
    const message = {
      roomId: req.body.room,
      text: req.body.message.text,
      sender: {
        username: req.body.message.sender.username,
        _id: req.body.message.sender.userId,
        avatar: req.body.message.sender.avatar,
      },
    };
    const newMessage = new Message(message);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUnreadMessagesCount = async (req, res) => {
  console.log(
    "[INFO] Getting unread messages count for rooms",
    req.body.roomIds
  );
  const { roomIds, username } = req.body;
  try {
    const unreadMessages = await Message.aggregate([
      { $match: { roomId: { $in: roomIds }, viewedBy: { $ne: username } } },
      { $group: { _id: "$roomId", count: { $sum: 1 } } },
    ]);

    const result = roomIds.map((roomId) => {
      const message = unreadMessages.find(
        (item) => item._id.toString() === roomId
      );
      const data = {
        id: roomId,
        count: message ? message.count : 0,
      };
      return data;
    });

    res.json({ unreadMessages: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.query.id);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveMessage = async (req, res) => {
  console.log("[INFO] Saving message data");
  try {
    console.log(req.body.message);
    const newMessage = new Message(req.body.message);
    const savedMessage = await newMessage.save();
    console.log("[SUCCESS] Message saved successfully");
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error("[ERROR] Error saving message:", err);
    res.status(400).json({ error: err.message });
  }
};
