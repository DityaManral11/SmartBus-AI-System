const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const emailExists = (email, callback) => {
  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (error, results) => {
      if (error) return callback(error);
      callback(null, results.length > 0);
    }
  );
};

// ================= STUDENT REGISTER =================

exports.registerStudent = async (req, res) => {
  const {
    full_name,
    email,
    phone,
    roll_number,
    semester,
    password,
    confirm_password,
  } = req.body;

  if (
    !full_name ||
    !email ||
    !phone ||
    !roll_number ||
    !semester ||
    !password ||
    !confirm_password
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  emailExists(email, async (error, exists) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.beginTransaction((transactionError) => {
        if (transactionError) {
          return res.status(500).json({
            success: false,
            message: "Could not start registration",
          });
        }

        const userQuery = `
          INSERT INTO users
          (full_name, email, phone, password, role)
          VALUES (?, ?, ?, ?, 'student')
        `;

        db.query(
          userQuery,
          [full_name, email, phone, hashedPassword],
          (userError, userResult) => {
            if (userError) {
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Could not create student account",
                });
              });
            }

            const studentQuery = `
              INSERT INTO students
              (user_id, roll_number, semester)
              VALUES (?, ?, ?)
            `;

            db.query(
              studentQuery,
              [userResult.insertId, roll_number, semester],
              (studentError) => {
                if (studentError) {
                  return db.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message:
                        studentError.code === "ER_DUP_ENTRY"
                          ? "Roll number already registered"
                          : "Could not save student details",
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Registration could not be completed",
                      });
                    });
                  }

                  res.status(201).json({
                    success: true,
                    message: "Student registered successfully",
                  });
                });
              }
            );
          }
        );
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Password processing failed",
      });
    }
  });
};

// ================= DRIVER REGISTER =================

exports.registerDriver = async (req, res) => {
  const {
    full_name,
    email,
    phone,
    license_number,
    experience_years = 0,
    password,
    confirm_password,
  } = req.body;

  if (
    !full_name ||
    !email ||
    !phone ||
    !license_number ||
    !password ||
    !confirm_password
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  const experience = Number(experience_years);

  if (!Number.isInteger(experience) || experience < 0) {
    return res.status(400).json({
      success: false,
      message: "Experience years must be a non-negative whole number",
    });
  }

  emailExists(email, async (error, exists) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.beginTransaction((transactionError) => {
        if (transactionError) {
          return res.status(500).json({
            success: false,
            message: "Could not start registration",
          });
        }

        const userQuery = `
          INSERT INTO users
          (full_name, email, phone, password, role)
          VALUES (?, ?, ?, ?, 'driver')
        `;

        db.query(
          userQuery,
          [full_name.trim(), email.trim(), phone.trim(), hashedPassword],
          (userError, userResult) => {
            if (userError) {
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Could not create driver account",
                });
              });
            }

            const driverQuery = `
              INSERT INTO drivers
              (user_id, license_number, experience_years)
              VALUES (?, ?, ?)
            `;

            db.query(
              driverQuery,
              [
                userResult.insertId,
                license_number.trim(),
                experience,
              ],
              (driverError) => {
                if (driverError) {
                  return db.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message:
                        driverError.code === "ER_DUP_ENTRY"
                          ? "License number already registered"
                          : "Could not save driver details",
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message:
                          "Registration could not be completed",
                      });
                    });
                  }

                  res.status(201).json({
                    success: true,
                    message: "Driver registered successfully",
                  });
                });
              }
            );
          }
        );
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Password processing failed",
      });
    }
  });
};

// ================= ADMIN REGISTER =================

exports.registerAdmin = async (req, res) => {
  const {
    full_name,
    email,
    phone,
    secret_key,
    password,
    confirm_password,
  } = req.body;

  if (
    !full_name ||
    !email ||
    !phone ||
    !secret_key ||
    !password ||
    !confirm_password
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (secret_key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({
      success: false,
      message: "Invalid admin secret key",
    });
  }

  if (password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  emailExists(email, async (error, exists) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.beginTransaction((transactionError) => {
        if (transactionError) {
          return res.status(500).json({
            success: false,
            message: "Could not start registration",
          });
        }

        const userQuery = `
          INSERT INTO users
          (full_name, email, phone, password, role)
          VALUES (?, ?, ?, ?, 'admin')
        `;

        db.query(
          userQuery,
          [full_name, email, phone, hashedPassword],
          (userError, userResult) => {
            if (userError) {
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Could not create admin account",
                });
              });
            }

            db.query(
              "INSERT INTO admins (user_id) VALUES (?)",
              [userResult.insertId],
              (adminError) => {
                if (adminError) {
                  return db.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message: "Could not save admin details",
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Registration could not be completed",
                      });
                    });
                  }

                  res.status(201).json({
                    success: true,
                    message: "Admin registered successfully",
                  });
                });
              }
            );
          }
        );
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Password processing failed",
      });
    }
  });
};

// ================= LOGIN =================

const loginByRole = (requiredRole) => {
  return (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        if (results.length === 0) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const user = results[0];

        if (user.role !== requiredRole) {
          return res.status(403).json({
            success: false,
            message: `This account is not registered as ${requiredRole}`,
          });
        }

        if (user.status !== "active") {
          return res.status(403).json({
            success: false,
            message: "Your account is currently inactive",
          });
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatches) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const token = createToken(user);

        res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }
    );
  };
};

exports.loginStudent = loginByRole("student");
exports.loginDriver = loginByRole("driver");
exports.loginAdmin = loginByRole("admin");

// ================= CHANGE PASSWORD =================

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const {
      current_password,
      new_password,
      confirm_password,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    if (userRole !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "This password route is only available for students.",
      });
    }

    if (
      !current_password ||
      !new_password ||
      !confirm_password
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 8 characters.",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match.",
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from the current password.",
      });
    }

    db.query(
      "SELECT id, password, role FROM users WHERE id = ?",
      [userId],
      async (selectError, results) => {
        if (selectError) {
          console.error(
            "Change password select error:",
            selectError
          );

          return res.status(500).json({
            success: false,
            message: "Database error.",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "User account was not found.",
          });
        }

        const user = results[0];

        if (user.role !== "student") {
          return res.status(403).json({
            success: false,
            message:
              "This password route is only available for students.",
          });
        }

        const currentPasswordMatches =
          await bcrypt.compare(
            current_password,
            user.password
          );

        if (!currentPasswordMatches) {
          return res.status(401).json({
            success: false,
            message: "Current password is incorrect.",
          });
        }

        const newPasswordAlreadyUsed =
          await bcrypt.compare(
            new_password,
            user.password
          );

        if (newPasswordAlreadyUsed) {
          return res.status(400).json({
            success: false,
            message:
              "New password must be different from the current password.",
          });
        }

        const hashedPassword =
          await bcrypt.hash(new_password, 10);

        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId],
          (updateError, updateResult) => {
            if (updateError) {
              console.error(
                "Change password update error:",
                updateError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Password could not be updated.",
              });
            }

            if (updateResult.affectedRows === 0) {
              return res.status(404).json({
                success: false,
                message: "User account was not found.",
              });
            }

            return res.status(200).json({
              success: true,
              message:
                "Password updated successfully.",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(
      "Change password controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while changing the password.",
    });
  }
};