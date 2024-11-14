const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUsers);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logout);
router.post("/register", userController.registerUser);
router.get("/profile", authMiddleware, userController.profile);
router.get("/rooms", authMiddleware, userController.getUserRooms);
router.post(
  "/messages/viewed",
  authMiddleware,
  userController.updateMessageViews
);

module.exports = router;
