const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const logMiddleware = require("../middlewares/logMiddleware");
const csrfMiddleware = require("../middlewares/csrfMiddleware");

// router.use(authMiddleware);
// router.use(csrfMiddleware);
router.use(logMiddleware);

module.exports = router;
