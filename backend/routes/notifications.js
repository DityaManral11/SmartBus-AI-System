const express = require("express");
const router = express.Router();

const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notifications/notificationController");

// Create notification
router.post("/", createNotification);

// Get notifications of one user
router.get("/user/:userId", getUserNotifications);

// Mark notification as read
router.put("/:id/read", markNotificationAsRead);

// Mark all notifications as read for a user
router.put("/user/:userId/read-all", markAllNotificationsAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;