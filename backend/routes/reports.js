const { verifyToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  getAttendanceReport,
  getDriverReport,
  getBusReport,
} = require("../controllers/reports/reportController");

router.get("/attendance", verifyToken, getAttendanceReport);
router.get("/drivers", getDriverReport);
router.get("/buses", getBusReport);

module.exports = router;