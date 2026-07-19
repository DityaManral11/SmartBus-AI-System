const express = require("express");
const router = express.Router();

const {
  assignStudentToBus,
  getAllAssignments,
  getDriverBusStudents,
  getStudentAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/studentBus/studentBusController");

// Assign student to bus
router.post("/", assignStudentToBus);

// Get all student-bus assignments
router.get("/", getAllAssignments);

// Get all students assigned to a driver's active bus
router.get("/driver/:driverId", getDriverBusStudents);

// Get one student's bus assignment
router.get("/student/:studentId", getStudentAssignment);

// Update assignment
router.put("/:id", updateAssignment);

// Delete assignment
router.delete("/:id", deleteAssignment);

module.exports = router;