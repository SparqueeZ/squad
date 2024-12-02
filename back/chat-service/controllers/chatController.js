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

exports.getLastMessagesByRoomId = async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    console.log(req.body);
    const message = {
      roomId: req.body.room,
      text: req.body.message.text,
      sender: req.body.message.sender,
    };
    const newMessage = new Message(message);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUnreadMessagesCount = async (req, res) => {
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
