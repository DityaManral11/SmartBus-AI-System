const db = require("../../db");

// ================= ATTENDANCE REPORT =================
exports.getAttendanceReport = (req, res) => {
  const sql = `
    SELECT
      a.id AS attendance_id,
      a.attendance_date,
      a.status,
      s.id AS student_id,
      s.roll_number,
      s.course,
      s.semester,
      u.full_name AS student_name
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN users u ON s.user_id = u.id
    ORDER BY a.attendance_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Attendance report error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch attendance report",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      report: results,
    });
  });
};

// ================= DRIVER REPORT =================
exports.getDriverReport = (req, res) => {
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
      d.rating
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Driver report error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch driver report",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      report: results,
    });
  });
};

// ================= BUS REPORT =================
exports.getBusReport = (req, res) => {
  const sql = `
    SELECT
      id AS bus_id,
      bus_number,
      bus_name,
      capacity,
      status
    FROM buses
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Bus report error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch bus report",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      report: results,
    });
  });
};