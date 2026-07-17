const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
} = require("../controllers/admin/dashboardController");

router.get("/", verifyToken, authorizeRoles("admin"), getAdminDashboard);

module.exports = router;