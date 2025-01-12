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
router.get("/rooms", authenticateToken, authController.getUserRooms);
// router.post(
//   "/internal/rooms/:userId",
//   authenticateToken,
//   authController.createPrivateRoom
// );

router.post("/internal/user/data", authController.authenticateToken);
router.put("/internal/rooms/:userId", authController.updateUserRooms);

// TODO : Changer la route et en créer une pour pouvoir récupérer les données de l'utilisateur
router.post(
  "/messages/viewed",
  authenticateToken,
  authController.updateMessageViews
);

module.exports = router;
