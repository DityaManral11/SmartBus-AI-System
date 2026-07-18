const db = require("../../db");
const bcrypt = require("bcrypt");

const getLoggedInUserId = (req) => {
  return req.user?.id || req.user?.userId;
};

// ================= GET ADMIN SETTINGS =================
exports.getAdminSettings = (req, res) => {
  const adminId = getLoggedInUserId(req);

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  const sql = `
    SELECT
      id,
      full_name,
      email,
      phone,
      school_name,
      notifications_enabled,
      location_enabled,
      two_factor_enabled
    FROM users
    WHERE id = ? AND role = 'admin'
    LIMIT 1
  `;

  db.query(sql, [adminId], (error, results) => {
    if (error) {
      console.error("Get settings error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not fetch settings.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    const admin = results[0];

    return res.status(200).json({
      success: true,
      settings: {
        schoolName:
          admin.school_name || "ABC Public School",
        adminName: admin.full_name,
        email: admin.email,
        phone: admin.phone || "",
        notifications:
          Boolean(admin.notifications_enabled),
        gps: Boolean(admin.location_enabled),
        twoFactor:
          Boolean(admin.two_factor_enabled),
      },
    });
  });
};

// ================= UPDATE ADMIN SETTINGS =================
exports.updateAdminSettings = (req, res) => {
  const adminId = getLoggedInUserId(req);

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  const {
    schoolName,
    adminName,
    email,
    phone,
    notifications,
    gps,
    twoFactor,
  } = req.body;

  if (!schoolName?.trim()) {
    return res.status(400).json({
      success: false,
      message: "School name is required.",
    });
  }

  if (!adminName?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Admin name is required.",
    });
  }

  if (!email?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  const checkEmailSql = `
    SELECT id
    FROM users
    WHERE email = ? AND id != ?
    LIMIT 1
  `;

  db.query(
    checkEmailSql,
    [email.trim(), adminId],
    (checkError, existingUsers) => {
      if (checkError) {
        console.error(
          "Email check error:",
          checkError
        );

        return res.status(500).json({
          success: false,
          message: "Could not validate email.",
        });
      }

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "This email is already used by another account.",
        });
      }

      const updateSql = `
        UPDATE users
        SET
          school_name = ?,
          full_name = ?,
          email = ?,
          phone = ?,
          notifications_enabled = ?,
          location_enabled = ?,
          two_factor_enabled = ?
        WHERE id = ? AND role = 'admin'
      `;

      const values = [
        schoolName.trim(),
        adminName.trim(),
        email.trim(),
        phone?.trim() || null,
        notifications ? 1 : 0,
        gps ? 1 : 0,
        twoFactor ? 1 : 0,
        adminId,
      ];

      db.query(
        updateSql,
        values,
        (updateError, result) => {
          if (updateError) {
            console.error(
              "Update settings error:",
              updateError
            );

            return res.status(500).json({
              success: false,
              message:
                "Could not update settings.",
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message:
                "Admin account not found.",
            });
          }

          return res.status(200).json({
            success: true,
            message:
              "Settings updated successfully.",
          });
        }
      );
    }
  );
};

// ================= CHANGE PASSWORD =================
exports.changePassword = (req, res) => {
  const adminId = getLoggedInUserId(req);

  if (!adminId) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  const {
    currentPassword,
    newPassword,
  } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message:
        "Current password and new password are required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message:
        "New password must contain at least 6 characters.",
    });
  }

  const selectSql = `
    SELECT password
    FROM users
    WHERE id = ? AND role = 'admin'
    LIMIT 1
  `;

  db.query(
    selectSql,
    [adminId],
    async (error, results) => {
      if (error) {
        console.error(
          "Password fetch error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Could not verify current password.",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Admin account not found.",
        });
      }

      try {
        const passwordMatches =
          await bcrypt.compare(
            currentPassword,
            results[0].password
          );

        if (!passwordMatches) {
          return res.status(400).json({
            success: false,
            message:
              "Current password is incorrect.",
          });
        }

        const hashedPassword =
          await bcrypt.hash(newPassword, 10);

        const updatePasswordSql = `
          UPDATE users
          SET password = ?
          WHERE id = ? AND role = 'admin'
        `;

        db.query(
          updatePasswordSql,
          [hashedPassword, adminId],
          (updateError) => {
            if (updateError) {
              console.error(
                "Password update error:",
                updateError
              );

              return res.status(500).json({
                success: false,
                message:
                  "Could not update password.",
              });
            }

            return res.status(200).json({
              success: true,
              message:
                "Password updated successfully.",
            });
          }
        );
      } catch (bcryptError) {
        console.error(
          "Password processing error:",
          bcryptError
        );

        return res.status(500).json({
          success: false,
          message:
            "Could not process password.",
        });
      }
    }
  );
};