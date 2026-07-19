const express = require("express");
const router = express.Router();

const adminAuthRoutes = require("./auth/adminAuth");
const studentAuthRoutes = require("./auth/studentAuth");
const driverAuthRoutes = require("./auth/driverAuth");
const forgotPasswordRoutes = require(
  "./auth/forgotPassword"
);

router.use("/admin", adminAuthRoutes);
router.use("/student", studentAuthRoutes);
router.use("/driver", driverAuthRoutes);

router.use(
  "/forgot-password",
  forgotPasswordRoutes
);

module.exports = router;