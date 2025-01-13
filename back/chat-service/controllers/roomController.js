const axios = require("../config/axios");
const Room = require("../models/roomModel");
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
  console.log(`[INFO] - getRoomById - roomId : ${req.params.roomId}`);
  try {
    const room = await Room.findById(req.params.roomId).select(
      "-createdAt -updatedAt -__v"
    );
    console.log(room);
    const messages = await Message.find({ roomId: req.params.roomId })
      .select("-createdAt -updatedAt -__v -roomId")
      .sort({ createdAt: -1 })
      .limit(20);

    console.log("[SUCCESS] - getRoomById - room sended successfully");
    res.json({
      ...room._doc,
      messages,
    });
  } catch (err) {
    console.error("[ERROR] - getRoomById - ", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    const savedRoom = await newRoom.save();
    const userIds = req.body.users;
    const privateRoom = req.body.private;

    // Ajouter les utilisateurs à la salle
    await Promise.all(
      userIds.map(async (userId) => {
        const response = await axios.authService.post(
          `/internal/rooms/${userId}`,
          {
            roomId: savedRoom._id.toString(),
          }
        );
        console.log(response.data);
      })
    );

    // console.log(userIds);
    // await Promise.all(
    //   userIds.map(async (userId) => {
    //     const response = await axios.userService.post(`/internal/${userId}`, {
    //       roomId: savedRoom._id.toString(),
    //     });
    //     console.log(response.data);
    //   })
    // );

    res.status(201).json(savedRoom);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err });
  }
};

exports.addUserToRoom = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    // Vérifier si la room existe
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Vérifier si l'utilisateur n'est pas déjà dans la room
    if (room.users.some((user) => user.userId.toString() === userId)) {
      return res.status(400).json({ message: "User already in the room" });
    }

    // Ajouter l'utilisateur à la liste des users de la room avec le statut 'accepted'
    room.users.push({ userId, status: "accepted" });
    await room.save();

    // Appeler le service auth pour mettre à jour les rooms de l'utilisateur
    await axios.authService.put(`/internal/rooms/${userId}`, {
      roomId,
      status: "accepted",
    });

    res.status(200).json({ message: "User added to room successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

async function addRoomToUser(userId, roomId) {
  console.log(roomId);
  try {
    const response = await axios.authService.put(`/internal/rooms/${userId}`, {
      roomId,
    });
    return response;
  } catch (err) {
    console.error(err);
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

  console.log("[INFO] - uploadFile - req.file ");
  let { roomId, sender } = req.body;
  sender = JSON.parse(sender);

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

    res.status(201).json({
      message: "Fichier uploadé et message enregistré avec succès",
      ...savedMessage._doc,
    });
  } catch (err) {
    console.error(
      "[ERROR] - uploadFile - Erreur lors de l'enregistrement du message :",
      err
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getFile = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../uploads", fileName);
  console.log("[INFO] - getFile - filePath : ", filePath);
  console.log(fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Fichier introuvable" });
    }
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Erreur serveur" });
      }
    });
  });
};

exports.updateMessageViews = async (req, res) => {
  console.log("Updating message views");
  const { username, messageId } = req.body;
  try {
    const messages = await updateMessageViewsLogic(messageId, username);
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

exports.createPrivateRoom = async (req, res) => {
  const { userId } = req.user;
  const { title, description, private, category, users } = req.body;
  users.push(userId);

  // Vérifier si une salle privée existe déjà avec les mêmes utilisateurs
  const existingRoom = await Room.findOne({
    users: { $all: users },
    private: true,
  }).select("-createdAt -updatedAt -__v");
  if (existingRoom) {
    console.log(
      "[INFO] Private room already exists with the same users, returning existing room"
    );
    return res
      .status(200)
      .json({ message: "Private room already exists", existingRoom });
  }

  try {
    const room = new Room({
      title,
      description,
      private,
      category,
      users,
    });
    const savedRoom = await room.save();

    // Ajouter les rooms dans la liste des rooms de chaque utilisateur
    console.log("[INFO] Adding room to users");
    await Promise.all(
      users.map(async (user) => {
        const response = await axios.authService.put(
          `/internal/rooms/${user}`,
          {
            roomId: savedRoom._id.toString(),
          }
        );
      })
    );
    console.log("[SUCCESS] Users added to room successfully");

    console.log("[SUCCESS] Private room created successfully");
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("[ERROR] Error while creating private room :", error);
    res.status(500).json({ error: error.message });
  }
};

exports.sendRoomInvitation = async (req, res) => {
  const { roomId, userId } = req.body;
  const invitingUserId = req.user.userId;

  try {
    // Vérifier si la room existe
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Vérifier si l'utilisateur qui invite est présent dans la room
    if (!room.users.some((user) => user.userId.toString() === invitingUserId)) {
      return res.status(403).json({ message: "Inviting user not in the room" });
    }

    // Vérifier si l'utilisateur n'est pas déjà dans la room
    if (room.users.some((user) => user.userId.toString() === userId)) {
      return res.status(400).json({ message: "User already in the room" });
    }

    // Ajouter l'utilisateur à la liste des users de la room avec le statut 'pending'
    room.users.push({ userId, status: "pending" });
    await room.save();

    // Appeler le service auth pour mettre à jour les rooms de l'utilisateur et envoyer une notification
    await axios.authService.post("/internal/rooms/invite", {
      roomId,
      userId,
      roomTitle: room.title,
    });

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoomUserStatus = async (req, res) => {
  const { roomId, userId, status } = req.body;

  try {
    // Vérifier si la room existe
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Mettre à jour le statut de l'utilisateur dans la room
    const user = room.users.find((user) => user.userId.toString() === userId);
    if (user) {
      user.status = status;
      await room.save();
      res.status(200).json({ message: "User status updated successfully" });
    } else {
      res.status(404).json({ message: "User not found in the room" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
