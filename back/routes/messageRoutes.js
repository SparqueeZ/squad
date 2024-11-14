const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const roomController = require("../controllers/roomController");

router.get("/", messageController.getAllMessages);
router.post("/", messageController.createMessage);
router.get("/rooms/:roomId", messageController.getMessagesByRoomId);

router.get("/rooms", roomController.getAllRooms);
router.post("/rooms", roomController.createRoom);

module.exports = router;
