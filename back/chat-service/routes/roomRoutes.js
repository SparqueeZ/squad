const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const multer = require("multer");
const path = require("path"); // Add this line

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", roomController.getAllRooms);
router.get("/:roomId", roomController.getRoomById);
router.post("/", roomController.createRoom);
// router.post("/private", roomController.createPrivateRoom);

router.get("/internal/:roomId", roomController.getRoomInformations);
router.post("/internal/addUser/:roomId", roomController.addUserToRoom);

router.post("/upload", upload.single("file"), roomController.uploadFile);

module.exports = router;
