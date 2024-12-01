const axios = require("axios");
const Room = require("../models/roomModel");
// const User = require("../models/userModel");
const Message = require("../models/messageModel");

async function getUserById(userId) {
  try {
    const response = await axios.get(
      `http://user-service:3002/api/users/${userId}`
    );
    return response.data;
  } catch (err) {
    throw new Error("Error fetching user data");
  }
}

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
    await Promise.all(
      userIds.map(async (userId) => {
        const user = await getUserById(userId);
        user.rooms.push(savedRoom._id);
        await axios.put(`http://user-service:3002/api/users/${userId}`, user);
      })
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
