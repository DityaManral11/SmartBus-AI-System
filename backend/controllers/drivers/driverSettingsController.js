const bcrypt = require("bcrypt");
const db = require("../../db");

// ================= GET DRIVER SETTINGS =================
exports.getDriverSettings = (req, res) => {
  const driverId = Number(req.params.driverId);

  if (!Number.isInteger(driverId) || driverId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid driver ID is required",
    });
  }

  const driverQuery = `
    SELECT
      d.id AS driver_id,
      d.user_id,
      u.full_name,
      u.email
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
    LIMIT 1
  `;

  db.query(driverQuery, [driverId], (driverError, driverResults) => {
    if (driverError) {
      console.error("Get driver error:", driverError);

      return res.status(500).json({
        success: false,
        message: "Could not fetch driver",
      });
    }

    if (driverResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const settingsQuery = `
      SELECT
        notifications_enabled,
        live_location_enabled,
        dark_mode_enabled
      FROM driver_settings
      WHERE driver_id = ?
      LIMIT 1
    `;

    db.query(
      settingsQuery,
      [driverId],
      (settingsError, settingsResults) => {
        if (settingsError) {
          console.error(
            "Get driver settings error:",
            settingsError
          );

          return res.status(500).json({
            success: false,
            message: "Could not fetch driver settings",
          });
        }

        if (settingsResults.length === 0) {
          const insertQuery = `
            INSERT INTO driver_settings
            (
              driver_id,
              notifications_enabled,
              live_location_enabled,
              dark_mode_enabled
            )
            VALUES (?, 1, 1, 0)
          `;

          db.query(
            insertQuery,
            [driverId],
            (insertError) => {
              if (insertError) {
                console.error(
                  "Create driver settings error:",
                  insertError
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Could not create driver settings",
                });
              }

              return res.status(200).json({
                success: true,
                settings: {
                  notifications_enabled: true,
                  live_location_enabled: true,
                  dark_mode_enabled: false,
                },
              });
            }
          );

          return;
        }

        const settings = settingsResults[0];

        return res.status(200).json({
          success: true,
          settings: {
            notifications_enabled: Boolean(
              settings.notifications_enabled
            ),
            live_location_enabled: Boolean(
              settings.live_location_enabled
            ),
            dark_mode_enabled: Boolean(
              settings.dark_mode_enabled
            ),
          },
        });
      }
    );
  });
};

// ================= UPDATE PREFERENCES =================
exports.updateDriverPreferences = (req, res) => {
  const driverId = Number(req.params.driverId);

  const {
    notifications_enabled,
    live_location_enabled,
    dark_mode_enabled,
  } = req.body;

  if (!Number.isInteger(driverId) || driverId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid driver ID is required",
    });
  }

  if (
    typeof notifications_enabled !== "boolean" ||
    typeof live_location_enabled !== "boolean" ||
    typeof dark_mode_enabled !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "All preference values must be boolean",
    });
  }

  const driverQuery = `
    SELECT id
    FROM drivers
    WHERE id = ?
    LIMIT 1
  `;

  db.query(driverQuery, [driverId], (driverError, driverResults) => {
    if (driverError) {
      console.error("Verify driver error:", driverError);

      return res.status(500).json({
        success: false,
        message: "Could not verify driver",
      });
    }

    if (driverResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const settingsQuery = `
      INSERT INTO driver_settings
      (
        driver_id,
        notifications_enabled,
        live_location_enabled,
        dark_mode_enabled
      )
      VALUES (?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        notifications_enabled = VALUES(notifications_enabled),
        live_location_enabled = VALUES(live_location_enabled),
        dark_mode_enabled = VALUES(dark_mode_enabled),
        updated_at = CURRENT_TIMESTAMP
    `;

    db.query(
      settingsQuery,
      [
        driverId,
        notifications_enabled ? 1 : 0,
        live_location_enabled ? 1 : 0,
        dark_mode_enabled ? 1 : 0,
      ],
      (settingsError) => {
        if (settingsError) {
          console.error(
            "Update driver settings error:",
            settingsError
          );

          return res.status(500).json({
            success: false,
            message: "Could not update driver settings",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Preferences updated successfully",
          settings: {
            notifications_enabled,
            live_location_enabled,
            dark_mode_enabled,
          },
        });
      }
    );
  });
};

// ================= CHANGE PASSWORD =================
exports.changeDriverPassword = (req, res) => {
  const driverId = Number(req.params.driverId);

  const {
    current_password,
    new_password,
    confirm_password,
  } = req.body;

  if (!Number.isInteger(driverId) || driverId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid driver ID is required",
    });
  }

  if (
    !current_password ||
    !new_password ||
    !confirm_password
  ) {
    return res.status(400).json({
      success: false,
      message: "All password fields are required",
    });
  }

  if (new_password.length < 8) {
    return res.status(400).json({
      success: false,
      message:
        "New password must contain at least 8 characters",
    });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "New passwords do not match",
    });
  }

  if (current_password === new_password) {
    return res.status(400).json({
      success: false,
      message:
        "New password must be different from current password",
    });
  }

  const query = `
    SELECT
      d.user_id,
      u.password
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
    LIMIT 1
  `;

  db.query(query, [driverId], async (error, results) => {
    if (error) {
      console.error("Get driver password error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not verify current password",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    try {
      const passwordMatches = await bcrypt.compare(
        current_password,
        results[0].password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(
        new_password,
        10
      );

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, results[0].user_id],
        (updateError) => {
          if (updateError) {
            console.error(
              "Update password error:",
              updateError
            );

            return res.status(500).json({
              success: false,
              message: "Could not update password",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Password updated successfully",
          });
        }
      );
    } catch (bcryptError) {
      console.error("Password processing error:", bcryptError);

      return res.status(500).json({
        success: false,
        message: "Could not process password",
      });
    }
  });
};