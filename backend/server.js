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

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bus-routes", busRouteRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/drivers", driverRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartBus backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});