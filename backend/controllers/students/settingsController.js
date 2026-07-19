const db = require("../../db");

// ================= GET STUDENT SETTINGS =================

exports.getStudentSettings = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const userSql = `
    SELECT id, role
    FROM users
    WHERE id = ?
  `;

  db.query(userSql, [userId], (userError, userResult) => {
    if (userError) {
      console.error(
        "Student settings user check error:",
        userError
      );

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userResult[0].role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Settings are only available for students",
      });
    }

    const settingsSql = `
      SELECT
        id,
        user_id,
        notifications_enabled,
        live_tracking_enabled,
        dark_mode,
        language,
        created_at,
        updated_at
      FROM student_settings
      WHERE user_id = ?
    `;

    db.query(
      settingsSql,
      [userId],
      (settingsError, settingsResult) => {
        if (settingsError) {
          console.error(
            "Get student settings error:",
            settingsError
          );

          return res.status(500).json({
            success: false,
            message: "Could not fetch student settings",
          });
        }

        // First time student opens settings:
        // return default values even if row does not exist.
        if (settingsResult.length === 0) {
          return res.status(200).json({
            success: true,
            settings: {
              user_id: Number(userId),
              notifications_enabled: 1,
              live_tracking_enabled: 1,
              dark_mode: 0,
              language: "English",
            },
          });
        }

        return res.status(200).json({
          success: true,
          settings: settingsResult[0],
        });
      }
    );
  });
};

// ================= UPDATE STUDENT SETTINGS =================

exports.updateStudentSettings = (req, res) => {
  const { userId } = req.params;

  const {
    notifications_enabled,
    live_tracking_enabled,
    dark_mode,
    language,
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const allowedLanguages = ["English", "Hindi"];

  const selectedLanguage =
    language && allowedLanguages.includes(language)
      ? language
      : "English";

  const notificationValue =
    notifications_enabled === true ||
    notifications_enabled === 1
      ? 1
      : 0;

  const trackingValue =
    live_tracking_enabled === true ||
    live_tracking_enabled === 1
      ? 1
      : 0;

  const darkModeValue =
    dark_mode === true || dark_mode === 1
      ? 1
      : 0;

  const userSql = `
    SELECT id, role
    FROM users
    WHERE id = ?
  `;

  db.query(userSql, [userId], (userError, userResult) => {
    if (userError) {
      console.error(
        "Update settings user check error:",
        userError
      );

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userResult[0].role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Settings are only available for students",
      });
    }

    const sql = `
      INSERT INTO student_settings
      (
        user_id,
        notifications_enabled,
        live_tracking_enabled,
        dark_mode,
        language
      )
      VALUES (?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        notifications_enabled =
          VALUES(notifications_enabled),

        live_tracking_enabled =
          VALUES(live_tracking_enabled),

        dark_mode =
          VALUES(dark_mode),

        language =
          VALUES(language)
    `;

    db.query(
      sql,
      [
        userId,
        notificationValue,
        trackingValue,
        darkModeValue,
        selectedLanguage,
      ],
      (error) => {
        if (error) {
          console.error(
            "Update student settings error:",
            error
          );

          return res.status(500).json({
            success: false,
            message: "Could not update student settings",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Settings updated successfully",
          settings: {
            user_id: Number(userId),
            notifications_enabled: notificationValue,
            live_tracking_enabled: trackingValue,
            dark_mode: darkModeValue,
            language: selectedLanguage,
          },
        });
      }
    );
  });
};