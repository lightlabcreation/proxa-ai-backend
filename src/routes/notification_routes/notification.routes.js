const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authorize");
const {
  getNotifications,
  markAsRead,
  getUnreadCount
} = require("../../controller/notification_controller/notification.controller");

// All notification routes require authentication
router.get("/notifications", authenticate, getNotifications);
router.put("/notifications/:id/read", authenticate, markAsRead);
router.get("/notifications/unread-count", authenticate, getUnreadCount);

module.exports = router;

