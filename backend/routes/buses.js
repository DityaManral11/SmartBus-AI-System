const express = require("express");
const router = express.Router();

const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  assignDriver,
  getAssignedDriver,
  unassignDriver,
} = require("../controllers/buses/busController");

// GET all buses
router.get("/", getAllBuses);

//GET assigned driver for a bus
router.get("/:id/assigned-driver", getAssignedDriver);

// GET single bus
router.get("/:id", getBusById);

// POST create bus
router.post("/", createBus);

// PUT update bus
router.put("/:id", updateBus);

// Assign driver to bus
router.put("/:id/assign-driver", assignDriver);

// Unassign driver from bus
router.delete("/:id/unassign-driver", unassignDriver);

// DELETE bus
router.delete("/:id", deleteBus);

module.exports = router;