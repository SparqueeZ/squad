const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const multer = require("multer");
const path = require("path");
const authenticateToken = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "audio/webm",
    "application/pdf",
    "text/javascript",
    "text/html",
    "text/css",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"));
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: fileFilter,
});

router.get("/", roomController.getAllRooms);
router.get("/:roomId", roomController.getRoomById);
router.post("/", roomController.createRoom);

router.get("/internal/:roomId", roomController.getRoomInformations);
router.post("/internal/addUser/:roomId", roomController.addUserToRoom);

router.post("/upload", upload.single("file"), roomController.uploadFile);
router.get("/files/:fileName", roomController.getFile);

router.post("/messages/viewed", roomController.updateMessageViews);

router.post("/private", authenticateToken, roomController.createPrivateRoom);

router.post("/invite", authenticateToken, roomController.sendRoomInvitation);
router.put(
  "/updateUserStatus",
  authenticateToken,
  roomController.updateRoomUserStatus
);

router.post("/addUser", authenticateToken, roomController.addUserToRoom);

router.post(
  "/invite/accept",
  authenticateToken,
  roomController.acceptRoomInvitation
);
router.post(
  "/invite/decline",
  authenticateToken,
  roomController.declineRoomInvitation
);
router.post("/leave", authenticateToken, roomController.leaveRoom);

module.exports = router;
