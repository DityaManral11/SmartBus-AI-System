const express = require("express");
const router = express.Router();

const {
  getStudentDashboard,
} = require("../controllers/students/dashboardController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

router.get("/:studentId", verifyToken, getStudentDashboard);

module.exports = router;