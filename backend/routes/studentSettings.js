const express = require("express");
const router = express.Router();

const {
  getStudentSettings,
  updateStudentSettings,
} = require(
  "../controllers/students/settingsController"
);

// Get student settings
router.get("/:userId", getStudentSettings);

// Create or update student settings
router.put("/:userId", updateStudentSettings);

module.exports = router;