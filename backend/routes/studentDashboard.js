const express = require("express");
const router = express.Router();

const {
  getStudentDashboard,
} = require("../controllers/students/dashboardController");

router.get("/:studentId", getStudentDashboard);

module.exports = router;