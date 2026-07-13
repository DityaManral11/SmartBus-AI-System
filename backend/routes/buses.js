const express = require("express");
const router = express.Router();

const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} = require("../controllers/buses/busController");

// GET all buses
router.get("/", getAllBuses);

// GET single bus
router.get("/:id", getBusById);

// POST create bus
router.post("/", createBus);

// PUT update bus
router.put("/:id", updateBus);

// DELETE bus
router.delete("/:id", deleteBus);

module.exports = router;