const express = require("express");
const router = express.Router();

const {
  updateBusLocation,
  getAllBusLocations,
} = require("../controllers/buses/busLocationController");

router.get("/", getAllBusLocations);
router.post("/", updateBusLocation);

module.exports = router;