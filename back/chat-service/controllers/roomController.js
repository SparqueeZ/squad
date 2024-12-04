const axios = require("../config/axios");
const Room = require("../models/roomModel");
// const User = require("../models/userModel");
const Message = require("../models/messageModel");

async function getUserById(userId) {
  try {
    const response = await axios.userService.get(`/${userId}`);
    return response.data;
  } catch (err) {
    throw new Error("Error fetching user data");
  }
}

exports.getRoomInformations = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    const response = {
      id: room._id,
      title: room.title,
      description: room.description,
      category: room.category,
      private: room.private,
      // users: room.users,
    };
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    console.log(userIds);
    await Promise.all(
      userIds.map(async (userId) => {
        const response = await axios.userService.post(`/internal/${userId}`, {
          roomId: savedRoom._id.toString(),
        });
        console.log(response.data);
      })
    );

    res.status(201).json(savedRoom);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err });
  }
};

exports.addUserToRoom = async (req, res) => {
  try {
    const userIsInRoom = await checkIfUserIsInRoom(
      req.body.userId,
      req.params.roomId
    );
    if (!userIsInRoom) {
      const response = await addRoomToUser(req.body.userId, req.params.roomId);
      if (response) {
        console.log(
          `[INFO] User ${req.body.userId} added to room ${req.params.roomId} successfully`
        );

        const room = await Room.findById(req.params.roomId);
        room.users.push(req.body.userId);
        await room.save();
        res.status(200).json(room);
      } else {
        console.error(
          `[ERROR] User ${req.body.userId} could not be added to room ${req.params.roomId}`
        );
      }
    } else {
      console.error(
        `[ERROR] User ${req.body.userId} is already in room ${req.params.roomId}`
      );
      res.status(400).json({ error: "User is already in room" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

async function addRoomToUser(userId, roomId) {
  console.log(roomId);
  try {
    const response = await axios.userService.post(`/internal/${userId}`, {
      roomId,
    });
    return response;
  } catch (err) {
    console.error(err.data.error);
    throw new Error("Error adding room to user");
  }
}

async function checkIfUserIsInRoom(userId, roomId) {
  try {
    const room = await Room.findOne({ _id: roomId });
    if (room.users.includes(userId)) {
      return true;
    }
    return false;
  } catch (err) {
    console.error(err.message);
    throw new Error("Error checking if user is in room");
  }
}

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
