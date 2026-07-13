const express = require("express");
const router = express.Router();

const adminAuthRoutes = require("./auth/adminAuth");
const studentAuthRoutes = require("./auth/studentAuth");
const driverAuthRoutes = require("./auth/driverAuth");

router.use("/admin", adminAuthRoutes);
router.use("/student", studentAuthRoutes);
router.use("/driver", driverAuthRoutes);

module.exports = router;