const express = require("express");
const router = express.Router();

const {
  createRouteStop,
  getAllRouteStops,
  getStopsByRouteId,
  updateRouteStop,
  deleteRouteStop,
} = require("../controllers/routes/routeStopController");

router.get("/", getAllRouteStops);
router.post("/", createRouteStop);
router.get("/route/:routeId", getStopsByRouteId);
router.put("/:id", updateRouteStop);
router.delete("/:id", deleteRouteStop);
module.exports = router;