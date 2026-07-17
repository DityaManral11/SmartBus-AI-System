const db = require("../../db");

// ================= STUDENT DASHBOARD =================
exports.getStudentDashboard = (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT

      s.id AS student_id,
      u.full_name AS student_name,
      u.email,
      u.phone,

      s.roll_number,
      s.semester,
      s.course,

      b.bus_number,
      b.bus_name,

      r.route_name,
      r.source,
      r.destination,

      sc.departure_time,
      sc.arrival_time,

      (
        SELECT COUNT(*)
        FROM notifications n
        WHERE n.user_id = s.user_id
        AND n.is_read = 0
      ) AS unread_notifications,

      (
        SELECT
          ROUND(
            (
              COUNT(
                CASE
                  WHEN status='Present'
                  THEN 1
                END
              ) * 100.0
            ) / COUNT(*),
            2
          )
        FROM attendance a
        WHERE a.student_id = s.id
      ) AS attendance_percentage

    FROM students s

    JOIN users u
      ON s.user_id = u.id

    LEFT JOIN student_bus_assignments sb
      ON s.id = sb.student_id

    LEFT JOIN buses b
      ON sb.bus_id = b.id

    LEFT JOIN schedules sc
      ON sc.bus_id = b.id
      AND sc.status='active'

    LEFT JOIN routes r
      ON sc.route_id = r.id

    WHERE s.id = ?

    LIMIT 1
  `;

  db.query(sql, [studentId], (err, results) => {

    if (err) {
      console.error("Student dashboard error:", err);

      return res.status(500).json({
        success:false,
        message:"Could not fetch student dashboard"
      });
    }

    if(results.length===0){
      return res.status(404).json({
        success:false,
        message:"Student not found"
      });
    }

    res.status(200).json({
      success:true,
      dashboard:results[0]
    });

  });

};