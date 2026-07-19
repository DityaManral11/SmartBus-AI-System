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

  // Check student
  db.query(
    "SELECT id FROM students WHERE id = ?",
    [student_id],
    (studentError, studentResults) => {
      if (studentError) {
        console.error("Verify student error:", studentError);

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

      // Check bus
      db.query(
        "SELECT id, capacity FROM buses WHERE id = ?",
        [bus_id],
        (busError, busResults) => {
          if (busError) {
            console.error("Verify bus error:", busError);

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

          // Check existing student assignment
          db.query(
            `
              SELECT id
              FROM student_bus_assignments
              WHERE student_id = ?
            `,
            [student_id],
            (checkError, checkResults) => {
              if (checkError) {
                console.error(
                  "Check existing assignment error:",
                  checkError
                );

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

              // Check bus capacity
              db.query(
                `
                  SELECT COUNT(*) AS assigned_count
                  FROM student_bus_assignments
                  WHERE bus_id = ?
                `,
                [bus_id],
                (countError, countResults) => {
                  if (countError) {
                    console.error(
                      "Check bus capacity error:",
                      countError
                    );

                    return res.status(500).json({
                      success: false,
                      message: "Could not check bus capacity",
                    });
                  }

                  const assignedCount = Number(
                    countResults[0].assigned_count
                  );

                  const busCapacity = Number(
                    busResults[0].capacity
                  );

                  if (assignedCount >= busCapacity) {
                    return res.status(409).json({
                      success: false,
                      message: "Bus capacity is full",
                    });
                  }

                  // Insert assignment
                  const query = `
                    INSERT INTO student_bus_assignments
                    (
                      student_id,
                      bus_id,
                      pickup_stop_id,
                      assigned_date
                    )
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

                      return res.status(201).json({
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
      sba.id AS assignment_id,
      sba.assigned_date,

      st.id AS student_id,
      st.roll_number,
      st.course,
      st.semester,
      st.guardian_name,
      st.guardian_phone,

      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,

      rs.id AS pickup_stop_id,
      rs.stop_name AS pickup_stop_name

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
      console.error("Get all assignments error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch assignments",
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      assignments: results,
    });
  });
};

// ================= GET STUDENT ASSIGNMENT =================
exports.getStudentAssignment = (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: "Student ID is required",
    });
  }

  const query = `
    SELECT
      sba.id AS assignment_id,
      sba.assigned_date,

      st.id AS student_id,
      st.roll_number,
      st.course,
      st.semester,
      st.guardian_name,
      st.guardian_phone,

      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,
      b.capacity,
      b.status AS bus_status,

      rs.id AS pickup_stop_id,
      rs.stop_name AS pickup_stop_name

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

    LIMIT 1
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Get student assignment error:", err);

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

    return res.status(200).json({
      success: true,
      assignment: results[0],
    });
  });
};

// ================= GET DRIVER BUS STUDENTS =================
exports.getDriverBusStudents = (req, res) => {
  const { driverId } = req.params;

  if (!driverId) {
    return res.status(400).json({
      success: false,
      message: "Driver ID is required",
    });
  }

  const driverQuery = `
    SELECT
      d.id AS driver_id,

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

  db.query(driverQuery, [driverId], (driverError, driverResults) => {
    if (driverError) {
      console.error(
        "Get driver bus information error:",
        driverError
      );

      return res.status(500).json({
        success: false,
        message: "Could not fetch driver bus information",
      });
    }

    if (driverResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const driverData = driverResults[0];

    if (!driverData.bus_id || !driverData.schedule_id) {
      return res.status(200).json({
        success: true,
        message: "No active bus schedule assigned to this driver",
        count: 0,
        bus: null,
        route: null,
        schedule: null,
        students: [],
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const studentsQuery = `
      SELECT
        sba.id AS assignment_id,
        sba.assigned_date,

        st.id AS student_id,
        st.roll_number,
        st.course,
        st.semester,
        st.guardian_name,
        st.guardian_phone,

        u.full_name AS student_name,
        u.email,
        u.phone,

        rs.id AS pickup_stop_id,
        rs.stop_name,

        a.id AS attendance_id,
        a.check_in_time,
        a.check_out_time,
        a.status AS attendance_status

      FROM student_bus_assignments sba

      JOIN students st
        ON sba.student_id = st.id

      JOIN users u
        ON st.user_id = u.id

      LEFT JOIN route_stops rs
        ON sba.pickup_stop_id = rs.id

      LEFT JOIN attendance a
        ON a.student_id = st.id
        AND a.bus_id = sba.bus_id
        AND a.schedule_id = ?
        AND DATE(a.attendance_date) = ?

      WHERE sba.bus_id = ?

      ORDER BY u.full_name ASC
    `;

    db.query(
      studentsQuery,
      [
        driverData.schedule_id,
        today,
        driverData.bus_id,
      ],
      (studentsError, studentsResults) => {
        if (studentsError) {
          console.error(
            "Get driver bus students error:",
            studentsError
          );

          return res.status(500).json({
            success: false,
            message:
              "Could not fetch students assigned to driver's bus",
          });
        }

        return res.status(200).json({
          success: true,
          count: studentsResults.length,

          bus: {
            id: driverData.bus_id,
            bus_number: driverData.bus_number,
            bus_name: driverData.bus_name,
            status: driverData.bus_status,
          },

          route: {
            id: driverData.route_id,
            route_name: driverData.route_name,
            source: driverData.source,
            destination: driverData.destination,
          },

          schedule: {
            id: driverData.schedule_id,
            departure_time: driverData.departure_time,
            arrival_time: driverData.arrival_time,
            status: driverData.schedule_status,
          },

          students: studentsResults,
        });
      }
    );
  });
};

// ================= GET STUDENTS BY BUS =================
exports.getStudentsByBus = (req, res) => {
  const { busId } = req.params;

  if (!busId) {
    return res.status(400).json({
      success: false,
      message: "Bus ID is required",
    });
  }

  const query = `
    SELECT
      sba.id AS assignment_id,
      sba.assigned_date,

      st.id AS student_id,
      st.roll_number,
      st.course,
      st.semester,
      st.guardian_name,
      st.guardian_phone,

      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,

      b.id AS bus_id,
      b.bus_number,
      b.bus_name,

      rs.id AS pickup_stop_id,
      rs.stop_name AS pickup_stop_name

    FROM student_bus_assignments sba

    JOIN students st
      ON sba.student_id = st.id

    JOIN users u
      ON st.user_id = u.id

    JOIN buses b
      ON sba.bus_id = b.id

    LEFT JOIN route_stops rs
      ON sba.pickup_stop_id = rs.id

    WHERE sba.bus_id = ?

    ORDER BY u.full_name ASC
  `;

  db.query(query, [busId], (err, results) => {
    if (err) {
      console.error("Get students by bus error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch students assigned to bus",
      });
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      students: results,
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

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID is required",
    });
  }

  if (!bus_id) {
    return res.status(400).json({
      success: false,
      message: "Bus ID is required",
    });
  }

  const date =
    assigned_date || new Date().toISOString().split("T")[0];

  // Check assignment
  db.query(
    `
      SELECT id, student_id, bus_id
      FROM student_bus_assignments
      WHERE id = ?
    `,
    [id],
    (assignmentError, assignmentResults) => {
      if (assignmentError) {
        console.error(
          "Verify assignment error:",
          assignmentError
        );

        return res.status(500).json({
          success: false,
          message: "Could not verify assignment",
        });
      }

      if (assignmentResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      // Check bus
      db.query(
        "SELECT id, capacity FROM buses WHERE id = ?",
        [bus_id],
        (busError, busResults) => {
          if (busError) {
            console.error("Verify bus error:", busError);

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

          // Count students excluding current assignment
          db.query(
            `
              SELECT COUNT(*) AS assigned_count
              FROM student_bus_assignments
              WHERE bus_id = ?
              AND id != ?
            `,
            [bus_id, id],
            (countError, countResults) => {
              if (countError) {
                console.error(
                  "Check updated bus capacity error:",
                  countError
                );

                return res.status(500).json({
                  success: false,
                  message: "Could not check bus capacity",
                });
              }

              const assignedCount = Number(
                countResults[0].assigned_count
              );

              const busCapacity = Number(
                busResults[0].capacity
              );

              if (assignedCount >= busCapacity) {
                return res.status(409).json({
                  success: false,
                  message: "Bus capacity is full",
                });
              }

              const updateQuery = `
                UPDATE student_bus_assignments
                SET
                  bus_id = ?,
                  pickup_stop_id = ?,
                  assigned_date = ?
                WHERE id = ?
              `;

              db.query(
                updateQuery,
                [
                  bus_id,
                  pickup_stop_id,
                  date,
                  id,
                ],
                (updateError) => {
                  if (updateError) {
                    console.error(
                      "Update assignment error:",
                      updateError
                    );

                    if (
                      updateError.code ===
                      "ER_NO_REFERENCED_ROW_2"
                    ) {
                      return res.status(400).json({
                        success: false,
                        message:
                          "Bus or pickup stop ID is invalid",
                      });
                    }

                    return res.status(500).json({
                      success: false,
                      message:
                        "Could not update assignment",
                    });
                  }

                  return res.status(200).json({
                    success: true,
                    message:
                      "Assignment updated successfully",
                    assignment: {
                      id: Number(id),
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
};

// ================= DELETE ASSIGNMENT =================
exports.deleteAssignment = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID is required",
    });
  }

  db.query(
    `
      DELETE FROM student_bus_assignments
      WHERE id = ?
    `,
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

      return res.status(200).json({
        success: true,
        message: "Student removed from bus successfully",
      });
    }
  );
};