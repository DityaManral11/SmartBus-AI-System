const express = require("express");
const router = express.Router();

const {
  verifyToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
  getAdminSettings,
  updateAdminSettings,
  changePassword,
} = require("../controllers/admin/settingsController");

// Get admin settings
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAdminSettings
);

// Update admin profile/settings
router.put(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  updateAdminSettings
);

// Change admin password
router.put(
  "/change-password",
  verifyToken,
  authorizeRoles("admin"),
  changePassword
);

module.exports = router;