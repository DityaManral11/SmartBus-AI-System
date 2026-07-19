const express = require("express");
const router = express.Router();

const {
  updateBusLocation,
  getAllBusLocations,
  getBusLocationById,
} = require("../controllers/buses/busLocationController");

// Get locations of all buses
router.get("/", getAllBusLocations);

// Get location of one bus
router.get("/:busId", getBusLocationById);

// Create or update bus location
router.post("/", updateBusLocation);

module.exports = router;