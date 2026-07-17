const db = require("../../db");

// ================= DRIVER DASHBOARD =================
exports.getDriverDashboard = (req, res) => {
  const { driverId } = req.params;

  const sql = `
    SELECT
      d.id AS driver_id,
      u.full_name AS driver_name,
      u.email,
      u.phone,
      d.license_number,
      d.experience_years,
      d.total_trips,
      d.total_distance,
      d.rating,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,
      b.status AS bus_status,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,

      s.id AS schedule_id,
      s.departure_time,
      s.arrival_time,
      s.status AS schedule_status

    FROM drivers d

    JOIN users u
      ON d.user_id = u.id

    LEFT JOIN schedules s
      ON d.id = s.driver_id
      AND s.status = 'active'

    LEFT JOIN buses b
      ON s.bus_id = b.id

    LEFT JOIN routes r
      ON s.route_id = r.id

    WHERE d.id = ?

    ORDER BY s.id DESC
    LIMIT 1
  `;

  db.query(sql, [driverId], (err, results) => {
    if (err) {
      console.error("Driver dashboard error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch driver dashboard",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      dashboard: results[0],
    });
  });
};