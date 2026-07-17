const db = require("../../db");

// ================= CREATE NOTIFICATION =================
exports.createNotification = (req, res) => {
  const { user_id, title, message } = req.body;

  if (!user_id || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "User ID, title and message are required",
    });
  }

  // Check if user exists
  db.query(
    "SELECT id FROM users WHERE id = ?",
    [user_id],
    (userErr, userResult) => {
      if (userErr) {
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

      const sql = `
        INSERT INTO notifications
        (user_id, title, message)
        VALUES (?, ?, ?)
      `;

      db.query(
        sql,
        [user_id, title.trim(), message.trim()],
        (err, result) => {
          if (err) {
            console.error(err);

            return res.status(500).json({
              success: false,
              message: "Could not create notification",
            });
          }

          res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification_id: result.insertId,
          });
        }
      );
    }
  );
};

// ================= GET USER NOTIFICATIONS =================
exports.getUserNotifications = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Could not fetch notifications",
      });
    }

    res.json({
      success: true,
      count: results.length,
      notifications: results,
    });
  });
};

// ================= MARK NOTIFICATION AS READ =================
exports.markNotificationAsRead = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Mark notification as read error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not update notification",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    }
  );
};

// ================= MARK ALL NOTIFICATIONS AS READ =================
exports.markAllNotificationsAsRead = (req, res) => {
  const { userId } = req.params;

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Mark all notifications as read error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not update notifications",
        });
      }

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        updated_count: result.changedRows,
      });
    }
  );
};

// ================= DELETE NOTIFICATION =================
exports.deleteNotification = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM notifications WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Delete notification error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not delete notification",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    }
  );
};