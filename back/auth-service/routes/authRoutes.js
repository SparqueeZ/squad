const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);
router.post("/register", authController.registerUser);

router.get("/", authController.getAllUsers);
router.get("/rooms", authMiddleware, authController.getUserRooms);
router.post("/internal/:userId", authController.updateUserRooms);

module.exports = router;
