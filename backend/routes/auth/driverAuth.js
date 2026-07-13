const express = require("express");
const router = express.Router();

const {
  registerDriver,
  loginDriver,
} = require("../../controllers/auth/authController");

router.post("/register", registerDriver);
router.post("/login", loginDriver);

module.exports = router;