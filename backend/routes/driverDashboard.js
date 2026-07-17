const express = require("express");
const router = express.Router();

const {
  getDriverDashboard,
} = require("../controllers/drivers/dashboardController");

router.get("/:driverId", getDriverDashboard);

module.exports = router;