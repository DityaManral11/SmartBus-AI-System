const db = require("../../db");

// ================= CREATE DRIVER =================
exports.createDriver = (req, res) => {
  const { user_id, license_number, experience_years = 0 } = req.body;

  if (!user_id || !license_number) {
    return res.status(400).json({
      success: false,
      message: "User ID and license number are required",
    });
  }

  const experience = Number(experience_years);

  if (!Number.isInteger(experience) || experience < 0) {
    return res.status(400).json({
      success: false,
      message: "Experience years must be a non-negative whole number",
    });
  }

  // Check whether the user exists and has driver role
  db.query(
    "SELECT id, role FROM users WHERE id = ?",
    [user_id],
    (userError, userResults) => {
      if (userError) {
        console.error("Driver user check error:", userError);

        return res.status(500).json({
          success: false,
          message: "Could not verify driver user",
        });
      }

      if (userResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (userResults[0].role !== "driver") {
        return res.status(400).json({
          success: false,
          message: "Selected user is not registered as a driver",
        });
      }

      const query = `
        INSERT INTO drivers
        (user_id, license_number, experience_years)
        VALUES (?, ?, ?)
      `;

      db.query(
        query,
        [user_id, license_number.trim(), experience],
        (error, result) => {
          if (error) {
            console.error("Create driver error:", error);

            if (error.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                success: false,
                message:
                  "Driver profile or license number already exists",
              });
            }

            return res.status(500).json({
              success: false,
              message: "Could not create driver",
            });
          }

          res.status(201).json({
            success: true,
            message: "Driver created successfully",
            driver: {
              id: result.insertId,
              user_id,
              license_number,
              experience_years: experience,
            },
          });
        }
      );
    }
  );
};

// ================= GET ALL DRIVERS =================
exports.getAllDrivers = (req, res) => {
  const query = `
    SELECT
      d.id,
      d.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      d.license_number,
      d.experience_years,
      d.total_trips,
      d.total_distance,
      d.rating
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    ORDER BY d.id DESC
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Get drivers error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch drivers",
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      drivers: results,
    });
  });
};

// ================= GET SINGLE DRIVER =================
exports.getDriverById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      d.id,
      d.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      d.license_number,
      d.experience_years,
      d.total_trips,
      d.total_distance,
      d.rating
    FROM drivers d
    INNER JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `;

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Get driver error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch driver",
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
      driver: results[0],
    });
  });
};

// ================= UPDATE DRIVER =================
exports.updateDriver = (req, res) => {
  const { id } = req.params;

  const {
    full_name,
    email,
    phone,
    status,
    license_number,
    experience_years,
    total_trips,
    total_distance,
    rating,
  } = req.body;

  if (!full_name || !email || !license_number) {
    return res.status(400).json({
      success: false,
      message: "Full name, email and license number are required",
    });
  }

  const allowedStatuses = ["active", "inactive", "on_leave"];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid driver status",
    });
  }

  const experience = Number(experience_years ?? 0);
  const trips = Number(total_trips ?? 0);
  const distance = Number(total_distance ?? 0);
  const driverRating = Number(rating ?? 0);

  if (!Number.isInteger(experience) || experience < 0) {
    return res.status(400).json({
      success: false,
      message: "Experience years must be a non-negative whole number",
    });
  }

  if (!Number.isInteger(trips) || trips < 0) {
    return res.status(400).json({
      success: false,
      message: "Total trips must be a non-negative whole number",
    });
  }

  if (Number.isNaN(distance) || distance < 0) {
    return res.status(400).json({
      success: false,
      message: "Total distance must be a non-negative number",
    });
  }

  if (
    Number.isNaN(driverRating) ||
    driverRating < 0 ||
    driverRating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 0 and 5",
    });
  }

  db.query(
    "SELECT user_id FROM drivers WHERE id = ?",
    [id],
    (findError, driverResults) => {
      if (findError) {
        console.error("Find driver error:", findError);

        return res.status(500).json({
          success: false,
          message: "Could not find driver",
        });
      }

      if (driverResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      const userId = driverResults[0].user_id;

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
                console.error("Update driver user error:", userError);

                res
                  .status(userError.code === "ER_DUP_ENTRY" ? 409 : 500)
                  .json({
                    success: false,
                    message:
                      userError.code === "ER_DUP_ENTRY"
                        ? "Email already exists"
                        : "Could not update driver user details",
                  });
              });
            }

            const updateDriverQuery = `
              UPDATE drivers
              SET
                license_number = ?,
                experience_years = ?,
                total_trips = ?,
                total_distance = ?,
                rating = ?
              WHERE id = ?
            `;

            db.query(
              updateDriverQuery,
              [
                license_number.trim(),
                experience,
                trips,
                distance,
                driverRating,
                id,
              ],
              (driverError) => {
                if (driverError) {
                  return db.rollback(() => {
                    console.error(
                      "Update driver profile error:",
                      driverError
                    );

                    res
                      .status(
                        driverError.code === "ER_DUP_ENTRY" ? 409 : 500
                      )
                      .json({
                        success: false,
                        message:
                          driverError.code === "ER_DUP_ENTRY"
                            ? "License number already exists"
                            : "Could not update driver profile",
                      });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Could not save driver updates",
                      });
                    });
                  }

                  res.status(200).json({
                    success: true,
                    message: "Driver updated successfully",
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

// ================= DELETE DRIVER =================
exports.deleteDriver = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT user_id FROM drivers WHERE id = ?",
    [id],
    (findError, results) => {
      if (findError) {
        console.error("Find driver error:", findError);

        return res.status(500).json({
          success: false,
          message: "Could not find driver",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
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
          "DELETE FROM drivers WHERE id = ?",
          [id],
          (driverError, driverResult) => {
            if (driverError) {
              return db.rollback(() => {
                console.error("Delete driver profile error:", driverError);

                res.status(500).json({
                  success: false,
                  message: "Could not delete driver profile",
                });
              });
            }

            if (driverResult.affectedRows === 0) {
              return db.rollback(() => {
                res.status(404).json({
                  success: false,
                  message: "Driver not found",
                });
              });
            }

            db.query(
              "DELETE FROM users WHERE id = ?",
              [userId],
              (userError) => {
                if (userError) {
                  return db.rollback(() => {
                    console.error(
                      "Delete driver account error:",
                      userError
                    );

                    res.status(500).json({
                      success: false,
                      message: "Could not delete driver account",
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message: "Driver deletion could not be completed",
                      });
                    });
                  }

                  res.status(200).json({
                    success: true,
                    message: "Driver deleted successfully",
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