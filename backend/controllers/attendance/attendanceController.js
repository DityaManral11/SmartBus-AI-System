const db = require("../../db");

exports.markAttendance = (req, res) => {
  const {
    student_id,
    bus_id,
    schedule_id,
    attendance_date,
  } = req.body;

  if (
    !student_id ||
    !bus_id ||
    !schedule_id ||
    !attendance_date
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const checkSql = `
    SELECT id
    FROM attendance
    WHERE student_id = ?
    AND attendance_date = ?
  `;

  db.query(
    checkSql,
    [student_id, attendance_date],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.error(checkErr);

        return res.status(500).json({
          success: false,
          message: "Could not verify attendance",
        });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Attendance already marked",
        });
      }

      const sql = `
        INSERT INTO attendance
        (
          student_id,
          bus_id,
          schedule_id,
          attendance_date,
          check_in_time
        )
        VALUES (?, ?, ?, ?, CURTIME())
      `;

      db.query(
        sql,
        [
          student_id,
          bus_id,
          schedule_id,
          attendance_date,
        ],
        (err, result) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Could not mark attendance",
            });
          }

          res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance_id: result.insertId,
          });
        }
      );
    }
  );
};

//GET TODAY'S ATTENDANCE FOR A STUDENT
exports.getTodayAttendance = (req, res) => {
  const sql = `
    SELECT
      a.id,
      s.roll_number,
      u.full_name AS student_name,
      b.bus_number,
      a.check_in_time,
      a.check_out_time,
      a.status
    FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN buses b ON a.bus_id = b.id
    WHERE a.attendance_date = CURDATE()
    ORDER BY a.check_in_time;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch attendance",
      });
    }

    res.json({
      success: true,
      count: results.length,
      attendance: results,
    });
  });
};

//GET ATTENDANCE BY STUDENT
exports.getAttendanceByStudent = (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT
      a.id,
      a.attendance_date,
      a.check_in_time,
      a.check_out_time,
      a.status,
      b.bus_number,
      r.route_name
    FROM attendance a
    JOIN buses b ON a.bus_id = b.id
    JOIN schedules sc ON a.schedule_id = sc.id
    JOIN routes r ON sc.route_id = r.id
    WHERE a.student_id = ?
    ORDER BY a.attendance_date DESC;
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch attendance",
      });
    }

    res.json({
      success: true,
      count: results.length,
      attendance: results,
    });
  });
};

exports.checkOut = (req, res) => {
  const { attendanceId } = req.params;

  const sql = `
    UPDATE attendance
    SET check_out_time = CURTIME()
    WHERE id = ?
  `;

  db.query(sql, [attendanceId], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not check out",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    res.json({
      success: true,
      message: "Check out successful",
    });
  });
};