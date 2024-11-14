const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    // Find the last message in this room
    const lastMessage = await Message.findOne({
      roomId: req.params.roomId,
    }).sort({ createdAt: -1 });
    res.json({ room, lastMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();

    // Update users with the new room ID
    const userIds = req.body.users;
    await User.updateMany(
      { _id: { $in: userIds } },
      { $push: { rooms: savedRoom._id } }
    );

    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// exports.createPrivateRoom = async (req, res) => {
//   try {
//     const newRoom = new Room(req.body);
//     const savedRoom = await newRoom.save();

//     // Update users with the new room ID
//     const userIds = req.body.users;
//     await User.updateMany(
//       { _id: { $in: userIds } },
//       { $push: { rooms: savedRoom._id } }
//     );

//     res.status(201).json(savedRoom);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
