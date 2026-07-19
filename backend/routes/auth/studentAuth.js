const express = require("express");
const router = express.Router();

const {
  registerStudent,
  loginStudent,
  changePassword,
} = require("../../controllers/auth/authController");

const {
  verifyToken,
} = require("../../middleware/authMiddleware");

router.post("/register", registerStudent);

router.post("/login", loginStudent);

router.put(
  "/change-password",
  verifyToken,
  changePassword
);

module.exports = router;