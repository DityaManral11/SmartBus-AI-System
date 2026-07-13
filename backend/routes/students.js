const express = require("express");
const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/students/studentController");

// Create Student
router.post("/", createStudent);

// Get All Students
router.get("/", getAllStudents);

// Get Single Student
router.get("/:id", getStudentById);

// Update Student
router.put("/:id", updateStudent);

// Delete Student
router.delete("/:id", deleteStudent);

module.exports = router;