const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"));
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// router.use((req, res, next) => {
//   const allowedOrigin = "http://localhost:3000";
//   if (req.headers.origin !== allowedOrigin) {
//     return res.status(403).send("Accès refusé");
//   }
//   next();
// });

router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);
router.post(
  "/register",
  upload.fields([{ name: "avatar" }, { name: "banner" }]),
  authController.registerUser
);
router.get("/profile", authenticateToken, authController.getUserProfile);
router.put("/infosUpdate", authenticateToken, authController.updateUserProfile);
router.post("/profile", authenticateToken, authController.getUserProfile);

router.post("/mfa/setup", authController.setupMFA);
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

router.get("/user/images", authenticateToken, authController.getUserImages);
router.post("/user/images", authenticateToken, authController.getUserImages);

module.exports = router;
