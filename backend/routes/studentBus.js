const express = require("express");
const router = express.Router();

const {
  assignStudentToBus,
  getAllAssignments,
  getStudentAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/studentBus/studentBusController");

// Assign Student to Bus
router.post("/", assignStudentToBus);
router.get("/", getAllAssignments);
router.get("/student/:studentId", getStudentAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);
module.exports = router;