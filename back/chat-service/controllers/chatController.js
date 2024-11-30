const Message = require("../models/messageModel");
const { getReadableTimestampParis } = require("../utils/date");

exports.getAllMessages = async (req, res) => {
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
  try {
    const messages = await Message.find({ roomId: req.params.roomId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
