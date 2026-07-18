const express = require("express");
const router = express.Router();

const {
  updateBusLocation,
  getAllBusLocations,
  getBusLocationById,
} = require("../controllers/buses/busLocationController");

router.get("/", getAllBusLocations);

router.get("/:busId", getBusLocationById);

router.post("/", updateBusLocation);

module.exports = router;