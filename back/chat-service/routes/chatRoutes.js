const express = require("express");
const {
  getAllMessages,
  getMessagesByRoomId,
  createMessage,
  getUnreadMessagesCount,
  getMessageById,
  getLastMessagesByRoomId,
  saveMessage,
  // getRoomInformations,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/", getAllMessages); // Get all messages
router.get("/:roomId", getMessagesByRoomId); // Get messages by roomId
router.post("/", createMessage); // Create a new message

router.get("/internal/last/:roomId", getLastMessagesByRoomId);
// router.get("/internal/:roomId", getRoomInformations);
router.post("/internal/unread", getUnreadMessagesCount);
router.get("/internal/findById", getMessageById);

router.post("/internal/messages/save", saveMessage);

module.exports = router;
