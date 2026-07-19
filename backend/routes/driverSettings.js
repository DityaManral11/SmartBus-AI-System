const express = require("express");
const router = express.Router();

const {
  getDriverSettings,
  updateDriverPreferences,
  changeDriverPassword,
} = require("../controllers/drivers/driverSettingsController");

router.get("/:driverId", getDriverSettings);

router.put(
  "/:driverId/preferences",
  updateDriverPreferences
);

router.put(
  "/:driverId/password",
  changeDriverPassword
);

module.exports = router;