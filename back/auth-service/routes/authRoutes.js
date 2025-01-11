const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);
router.post("/register", authController.registerUser);
router.get("/profile", authenticateToken, authController.getUserProfile);

router.post("/mfa/setup", authController.setupMFA);
router.post("/mfa/verify", authController.verifyMFA);
router.post("/mfa/reset", authController.resetMFA);

router.get("/", authController.getAllUsers);
router.get("/rooms", authMiddleware, authController.getUserRooms);
router.post("/internal/:userId", authController.updateUserRooms);

module.exports = router;
