const db = require("../../db");

// ================= CREATE STUDENT =================
exports.createStudent = (req, res) => {
  const {
    user_id,
    roll_number,
    semester,
    course,
    guardian_name,
    guardian_phone,
  } = req.body;

  if (!user_id || !roll_number) {
    return res.status(400).json({
      success: false,
      message: "User ID and Roll Number are required",
    });
  }

  db.query(
    `INSERT INTO students
    (user_id, roll_number, semester, course, guardian_name, guardian_phone)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      roll_number,
      semester,
      course,
      guardian_name,
      guardian_phone,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        studentId: result.insertId,
      });
    }
  );
};

// ================= GET ALL STUDENTS =================
exports.getAllStudents = (req, res) => {
  const query = `
    SELECT
      s.id,
      s.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      s.roll_number,
      s.semester,
      s.course,
      s.guardian_name,
      s.guardian_phone
    FROM students s
    INNER JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Get students error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch students",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      students: results,
    });
  });
};

// ================= GET SINGLE STUDENT =================
exports.getStudentById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      s.id,
      s.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      s.roll_number,
      s.semester,
      s.course,
      s.guardian_name,
      s.guardian_phone
    FROM students s
    INNER JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Get student error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch student",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      student: results[0],
    });
  });
};

// ================= UPDATE STUDENT =================
exports.updateStudent = (req, res) => {
  const { id } = req.params;

  const {
    full_name,
    email,
    phone,
    status,
    roll_number,
    semester,
    course,
    guardian_name,
    guardian_phone,
  } = req.body;

  if (!full_name || !email || !roll_number) {
    return res.status(400).json({
      success: false,
      message: "Full name, email and roll number are required",
    });
  }

  const allowedStatuses = ["active", "inactive", "on_leave"];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student status",
    });
  }

  db.query(
    "SELECT user_id FROM students WHERE id = ?",
    [id],
    (findError, studentResults) => {
      if (findError) {
        console.error("Find student error:", findError);

        return res.status(500).json({
          success: false,
          message: "Could not find student",
        });
      }

      if (studentResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const userId = studentResults[0].user_id;

      db.beginTransaction((transactionError) => {
        if (transactionError) {
          return res.status(500).json({
            success: false,
            message: "Could not start update transaction",
          });
        }

        const updateUserQuery = `
          UPDATE users
          SET full_name = ?, email = ?, phone = ?, status = ?
          WHERE id = ?
        `;

        db.query(
          updateUserQuery,
          [
            full_name.trim(),
            email.trim(),
            phone?.trim() || null,
            status || "active",
            userId,
          ],
          (userError) => {
            if (userError) {
              return db.rollback(() => {
                console.error("Update user error:", userError);

                res.status(userError.code === "ER_DUP_ENTRY" ? 409 : 500).json({
                  success: false,
                  message:
                    userError.code === "ER_DUP_ENTRY"
                      ? "Email already exists"
                      : "Could not update student user details",
                });
              });
            }

            const updateStudentQuery = `
              UPDATE students
              SET
                roll_number = ?,
                semester = ?,
                course = ?,
                guardian_name = ?,
                guardian_phone = ?
              WHERE id = ?
            `;

            db.query(
              updateStudentQuery,
              [
                roll_number.trim(),
                semester || null,
                course?.trim() || null,
                guardian_name?.trim() || null,
                guardian_phone?.trim() || null,
                id,
              ],
              (studentError) => {
                if (studentError) {
                  return db.rollback(() => {
                    console.error("Update student error:", studentError);

                    res
                      .status(studentError.code === "ER_DUP_ENTRY" ? 409 : 500)
                      .json({
                        success: false,
                        message:
                          studentError.code === "ER_DUP_ENTRY"
                            ? "Roll number already exists"
                            : "Could not update student profile",
                      });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Could not save student updates",
                      });
                    });
                  }

                  res.status(200).json({
                    success: true,
                    message: "Student updated successfully",
                  });
                });
              }
            );
          }
        );
      });
    }
  );
};

// ================= DELETE STUDENT =================
exports.deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT user_id FROM students WHERE id = ?",
    [id],
    (findError, results) => {
      if (findError) {
        console.error("Find student error:", findError);

        return res.status(500).json({
          success: false,
          message: "Could not find student",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const userId = results[0].user_id;

      db.beginTransaction((transactionError) => {
        if (transactionError) {
          return res.status(500).json({
            success: false,
            message: "Could not start delete transaction",
          });
        }

        db.query(
          "DELETE FROM students WHERE id = ?",
          [id],
          (studentError, studentResult) => {
            if (studentError) {
              return db.rollback(() => {
                console.error("Delete student profile error:", studentError);

                res.status(500).json({
                  success: false,
                  message: "Could not delete student profile",
                });
              });
            }

            if (studentResult.affectedRows === 0) {
              return db.rollback(() => {
                res.status(404).json({
                  success: false,
                  message: "Student not found",
                });
              });
            }

            db.query(
              "DELETE FROM users WHERE id = ?",
              [userId],
              (userError) => {
                if (userError) {
                  return db.rollback(() => {
                    console.error("Delete user account error:", userError);

                    res.status(500).json({
                      success: false,
                      message: "Could not delete student account",
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Student deletion could not be completed",
                      });
                    });
                  }

                  res.status(200).json({
                    success: true,
                    message: "Student deleted successfully",
                  });
                });
              }
            );
          }
        );
      });
    }
  );
};