const axios = require("../config/axios");
const Room = require("../models/roomModel");
//const User = require("../models/userModel");
const Message = require("../models/messageModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }

  const { roomId, sender } = req.body;

  const fileDetails = {
    text: `Fichier : ${req.file.originalname}`,
    type: "file",
    sender,
    roomId,
    viewedBy: [],
    filePath: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
  };

  try {
    // Enregistrer le message dans la base de données
    const newMessage = new Message(fileDetails);
    const savedMessage = await newMessage.save();

    // Émettre un événement WebSocket (si applicable)
    if (req.io && roomId) {
      req.io.to(roomId).emit("fileUploaded", {
        ...fileDetails,
        timestamp: savedMessage.createdAt,
      });
    }

    res.status(201).json({
      message: "Fichier uploadé et message enregistré avec succès",
      ...savedMessage._doc,
    });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement du message :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getFile = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../uploads", fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    res.download(filePath, fileName);
  });
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