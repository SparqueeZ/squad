const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const logMiddleware = require("../middlewares/logMiddleware");

router.use(logMiddleware);

router.get("/", userController.getAllUsers);
router.post("/", userController.createUsers);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logout);
router.post("/register", userController.registerUser);
router.get("/profile", authMiddleware, userController.getFullProfile);
router.get("/rooms", authMiddleware, userController.getUserRooms);
router.post(
  "/messages/viewed",
  authMiddleware,
  userController.updateMessageViews
);
module.exports = router;
