const express = require("express");
const router = express.Router();

const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require("../controllers/routes/routeController");

// Get all routes
router.get("/", getAllRoutes);

// Get route by ID
router.get("/:id", getRouteById);

// Create route
router.post("/", createRoute);

// Update route
router.put("/:id", updateRoute);

// Delete route
router.delete("/:id", deleteRoute);

module.exports = router;