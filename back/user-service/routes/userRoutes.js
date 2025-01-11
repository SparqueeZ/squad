const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const logMiddleware = require("../middlewares/logMiddleware");
const csrfMiddleware = require("../middlewares/csrfMiddleware");

// router.use(authMiddleware);
// router.use(csrfMiddleware);
router.use(logMiddleware);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUsers);
router.get("/profile", authMiddleware, userController.getFullProfile);
router.get("/rooms", authMiddleware, userController.getUserRooms);
router.post(
  "/messages/viewed",
  authMiddleware,
  userController.updateMessageViews
);
router.post("/internal/:userId", userController.updateUserRooms);
module.exports = router;
