require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const db = require("./db");

const app = express();

const busRoutes = require("./routes/buses");
const routeRoutes = require("./routes/routes");
const busRouteRoutes = require("./routes/busRoutes");
const studentRoutes = require("./routes/students");
const driverRoutes = require("./routes/drivers");
const scheduleRoutes = require("./routes/schedules");
const studentBusRoutes = require("./routes/studentBus");
const routeStopRoutes = require("./routes/routeStops");
const attendanceRoutes = require("./routes/attendance");
const busLocationRoutes = require("./routes/busLocation");
const notificationRoutes = require("./routes/notifications");
const adminDashboardRoutes = require("./routes/adminDashboard");
const driverDashboardRoutes = require("./routes/driverDashboard");
const studentDashboardRoutes = require("./routes/studentDashboard");
const reportRoutes = require("./routes/reports");
const adminSettingsRoutes = require("./routes/adminSettings");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bus-routes", busRouteRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/student-bus", studentBusRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/route-stops", routeStopRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/bus-location", busLocationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/driver/dashboard", driverDashboardRoutes);
app.use("/api/student/dashboard", studentDashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartBus backend is running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});