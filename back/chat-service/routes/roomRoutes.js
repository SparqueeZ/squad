const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getAllRooms);
router.get("/byId/:roomId", roomController.getRoomById);
router.post("/", roomController.createRoom);
// router.post("/private", roomController.createPrivateRoom);

module.exports = router;
