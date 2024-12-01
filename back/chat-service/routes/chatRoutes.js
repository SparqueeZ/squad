const express = require("express");
const {
  getAllMessages,
  getMessagesByRoomId,
  createMessage,
  getUnreadMessagesCount,
  getMessageById,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/", getAllMessages); // Get all messages
router.get("/:roomId", getMessagesByRoomId); // Get messages by roomId
router.post("/", createMessage); // Create a new message

router.post("/internal/unread", getUnreadMessagesCount);
router.post("/internal/unread/room", getUnreadMessagesCount);
router.get("/internal/findById", getMessageById);

module.exports = router;
