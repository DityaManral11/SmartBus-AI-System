const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getTodayAttendance,
  getAttendanceByStudent,
  checkOut,
} = require("../controllers/attendance/attendanceController");

router.post("/", markAttendance);
router.get("/today", getTodayAttendance);
router.get("/student/:studentId", getAttendanceByStudent);
router.put("/checkout/:attendanceId", checkOut);

module.exports = router;