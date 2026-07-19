const db = require("../../db");

// ================= STUDENT DASHBOARD =================
exports.getStudentDashboard = (req, res) => {
  const { studentId } = req.params;

  if (!studentId || Number.isNaN(Number(studentId))) {
    return res.status(400).json({
      success: false,
      message: "Valid student ID is required",
    });
  }

  const sql = `
    SELECT
      s.id AS student_id,
      s.user_id,
      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,

      s.roll_number,
      s.semester,
      s.course,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,
      b.registration_number,
      b.capacity,
      b.status AS bus_status,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,

      sc.id AS schedule_id,
      sc.departure_time,
      sc.arrival_time,
      sc.status AS schedule_status,

      d.id AS driver_id,
      du.full_name AS driver_name,
      du.email AS driver_email,
      du.phone AS driver_phone,
      d.license_number,
      d.experience_years,
      d.total_trips,
      d.total_distance,
      d.rating,

      COALESCE(
        (
          SELECT bl.latitude
          FROM bus_locations bl
          WHERE bl.bus_id = b.id
          ORDER BY bl.updated_at DESC, bl.id DESC
          LIMIT 1
        ),
        b.current_latitude
      ) AS current_latitude,

      COALESCE(
        (
          SELECT bl.longitude
          FROM bus_locations bl
          WHERE bl.bus_id = b.id
          ORDER BY bl.updated_at DESC, bl.id DESC
          LIMIT 1
        ),
        b.current_longitude
      ) AS current_longitude,

      (
        SELECT bl.speed
        FROM bus_locations bl
        WHERE bl.bus_id = b.id
        ORDER BY bl.updated_at DESC, bl.id DESC
        LIMIT 1
      ) AS current_speed,

      (
        SELECT bl.updated_at
        FROM bus_locations bl
        WHERE bl.bus_id = b.id
        ORDER BY bl.updated_at DESC, bl.id DESC
        LIMIT 1
      ) AS location_updated_at,

      (
        SELECT COUNT(*)
        FROM notifications n
        WHERE n.user_id = s.user_id
          AND n.is_read = 0
      ) AS unread_notifications,

      (
        SELECT ROUND(
          (
            SUM(
              CASE
                WHEN LOWER(a.status) = 'present' THEN 1
                ELSE 0
              END
            ) * 100.0
          ) / NULLIF(COUNT(*), 0),
          2
        )
        FROM attendance a
        WHERE a.student_id = s.id
      ) AS attendance_percentage

    FROM students s

    INNER JOIN users u
      ON s.user_id = u.id

    LEFT JOIN student_bus_assignments sb
      ON s.id = sb.student_id

    LEFT JOIN buses b
      ON sb.bus_id = b.id

    LEFT JOIN schedules sc
      ON sc.bus_id = b.id
      AND sc.status = 'active'

    LEFT JOIN routes r
      ON sc.route_id = r.id

    LEFT JOIN drivers d
      ON d.id = COALESCE(sc.driver_id, b.driver_id)

    LEFT JOIN users du
      ON d.user_id = du.id

    WHERE s.user_id = ?

    ORDER BY sc.id DESC
    LIMIT 1
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Student dashboard error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch student dashboard",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const dashboard = results[0];

    return res.status(200).json({
      success: true,
      dashboard: {
        ...dashboard,

        unread_notifications: Number(
          dashboard.unread_notifications || 0
        ),

        attendance_percentage: Number(
          dashboard.attendance_percentage || 0
        ),

        current_latitude:
          dashboard.current_latitude !== null
            ? Number(dashboard.current_latitude)
            : null,

        current_longitude:
          dashboard.current_longitude !== null
            ? Number(dashboard.current_longitude)
            : null,

        current_speed:
          dashboard.current_speed !== null
            ? Number(dashboard.current_speed)
            : 0,
      },
    });
  });
};