const express = require("express");
const router = express.Router();

const {
  getAllAssignments,
  assignRouteToBus,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/routes/busRouteController");

router.get("/", getAllAssignments);

router.post("/", assignRouteToBus);

router.put("/:id", updateAssignment);

router.delete("/:id", deleteAssignment);

module.exports = router;