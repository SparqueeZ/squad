const express = require("express");
const {
  getAllMessages,
  getMessagesByRoomId,
  createMessage,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/", getAllMessages); // Get all messages
router.get("/:roomId", getMessagesByRoomId); // Get messages by roomId
router.post("/", createMessage); // Create a new message

module.exports = router;
