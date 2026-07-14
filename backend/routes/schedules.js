const express = require("express");
const router = express.Router();

const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/schedules/scheduleController");

router.get("/", getAllSchedules);
router.get("/:id", getScheduleById);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;