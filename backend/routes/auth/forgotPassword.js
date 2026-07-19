const express = require("express");
const router = express.Router();

const {
  forgotPassword,
} = require("../../controllers/auth/authController");

router.put("/", forgotPassword);

module.exports = router;