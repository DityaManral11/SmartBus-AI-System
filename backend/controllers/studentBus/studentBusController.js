const db = require("../../db");

// ================= ASSIGN STUDENT TO BUS =================
exports.assignStudentToBus = (req, res) => {
  const {
    student_id,
    bus_id,
    pickup_stop_id = null,
    assigned_date,
  } = req.body;

  if (!student_id || !bus_id) {
    return res.status(400).json({
      success: false,
      message: "Student ID and Bus ID are required",
    });
  }

  const date =
    assigned_date || new Date().toISOString().split("T")[0];

  db.query(
    "SELECT id FROM students WHERE id = ?",
    [student_id],
    (studentError, studentResults) => {
      if (studentError) {
        return res.status(500).json({
          success: false,
          message: "Could not verify student",
        });
      }

      if (studentResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      db.query(
        "SELECT id, capacity FROM buses WHERE id = ?",
        [bus_id],
        (busError, busResults) => {
          if (busError) {
            return res.status(500).json({
              success: false,
              message: "Could not verify bus",
            });
          }

          if (busResults.length === 0) {
            return res.status(404).json({
              success: false,
              message: "Bus not found",
            });
          }

          db.query(
            "SELECT id FROM student_bus_assignments WHERE student_id = ?",
            [student_id],
            (checkError, checkResults) => {
              if (checkError) {
                return res.status(500).json({
                  success: false,
                  message: "Could not check existing assignment",
                });
              }

              if (checkResults.length > 0) {
                return res.status(409).json({
                  success: false,
                  message: "Student is already assigned to a bus",
                });
              }

              db.query(
                "SELECT COUNT(*) AS assigned_count FROM student_bus_assignments WHERE bus_id = ?",
                [bus_id],
                (countError, countResults) => {
                  if (countError) {
                    return res.status(500).json({
                      success: false,
                      message: "Could not check bus capacity",
                    });
                  }

                  if (
                    countResults[0].assigned_count >=
                    busResults[0].capacity
                  ) {
                    return res.status(409).json({
                      success: false,
                      message: "Bus capacity is full",
                    });
                  }

                  const query = `
                    INSERT INTO student_bus_assignments
                    (student_id, bus_id, pickup_stop_id, assigned_date)
                    VALUES (?, ?, ?, ?)
                  `;

                  db.query(
                    query,
                    [
                      student_id,
                      bus_id,
                      pickup_stop_id,
                      date,
                    ],
                    (insertError, result) => {
                      if (insertError) {
                        console.error(
                          "Assign student error:",
                          insertError
                        );

                        if (
                          insertError.code ===
                          "ER_NO_REFERENCED_ROW_2"
                        ) {
                          return res.status(400).json({
                            success: false,
                            message:
                              "Student, bus or pickup stop ID is invalid",
                          });
                        }

                        return res.status(500).json({
                          success: false,
                          message:
                            "Could not assign student to bus",
                        });
                      }

                      res.status(201).json({
                        success: true,
                        message:
                          "Student assigned to bus successfully",
                        assignment: {
                          id: result.insertId,
                          student_id,
                          bus_id,
                          pickup_stop_id,
                          assigned_date: date,
                        },
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// ================= GET ALL ASSIGNMENTS =================
exports.getAllAssignments = (req, res) => {
  const query = `
    SELECT
      sba.id,
      sba.assigned_date,

      st.id AS student_id,
      u.full_name AS student_name,
      st.roll_number,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,

      rs.id AS pickup_stop_id,
      rs.stop_name

    FROM student_bus_assignments sba

    JOIN students st
      ON sba.student_id = st.id

    JOIN users u
      ON st.user_id = u.id

    JOIN buses b
      ON sba.bus_id = b.id

    LEFT JOIN route_stops rs
      ON sba.pickup_stop_id = rs.id

    ORDER BY sba.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch assignments",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      assignments: results,
    });
  });
};

// ================= GET STUDENT ASSIGNMENT =================
exports.getStudentAssignment = (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT
      sba.id,
      sba.assigned_date,

      st.id AS student_id,
      u.full_name AS student_name,
      st.roll_number,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,

      rs.id AS pickup_stop_id,
      rs.stop_name

    FROM student_bus_assignments sba

    JOIN students st
      ON sba.student_id = st.id

    JOIN users u
      ON st.user_id = u.id

    JOIN buses b
      ON sba.bus_id = b.id

    LEFT JOIN route_stops rs
      ON sba.pickup_stop_id = rs.id

    WHERE st.id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch assignment",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      assignment: results[0],
    });
  });
};

// ================= UPDATE ASSIGNMENT =================
exports.updateAssignment = (req, res) => {
  const { id } = req.params;

  const {
    bus_id,
    pickup_stop_id = null,
    assigned_date,
  } = req.body;

  if (!bus_id) {
    return res.status(400).json({
      success: false,
      message: "Bus ID is required",
    });
  }

  const date =
    assigned_date || new Date().toISOString().split("T")[0];

  db.query(
    "SELECT id FROM buses WHERE id = ?",
    [bus_id],
    (busError, busResults) => {
      if (busError) {
        return res.status(500).json({
          success: false,
          message: "Could not verify bus",
        });
      }

      if (busResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Bus not found",
        });
      }

      const query = `
        UPDATE student_bus_assignments
        SET
          bus_id = ?,
          pickup_stop_id = ?,
          assigned_date = ?
        WHERE id = ?
      `;

      db.query(
        query,
        [
          bus_id,
          pickup_stop_id,
          date,
          id,
        ],
        (err, result) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Could not update assignment",
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Assignment not found",
            });
          }

          res.status(200).json({
            success: true,
            message: "Assignment updated successfully",
          });
        }
      );
    }
  );
};

// ================= DELETE ASSIGNMENT =================
exports.deleteAssignment = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM student_bus_assignments WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Delete assignment error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not delete assignment",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      res.json({
        success: true,
        message: "Student removed from bus successfully",
      });
    }
  );
};