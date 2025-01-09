const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");

const router = express.Router();

const validateRequest = require("../middlewares/validateRequest");
const {
  getMyNotifications,
  getMyUnreadNotifications,
  markAsRead,
  getAllNotifications,
  deleteNotification,
  // fetchNotificationById,
} = require("../controllers/notificationController");
const {
  notificationQuerySchema,
  notificationParamsSchema,
} = require("../helpers/schema");

// Get my notifications with pagination and filters
router.get(
  "/my",
  verifyUser,
  validateRequest(notificationQuerySchema, "query"),
  getMyNotifications
);

// Get my unread notifications
router.get(
  "/my/unread",
  verifyUser,
  validateRequest(notificationQuerySchema, "query"),
  getMyUnreadNotifications
);

// Mark notification as read
router.put(
  "/mark-as-read/:id",
  verifyUser,
  validateRequest(notificationParamsSchema, "params"),
  markAsRead
);

// Get all notifications (admin only)
router.get(
  "/all",
  verifyAdmin,
  validateRequest(notificationQuerySchema, "query"),
  getAllNotifications
);

// Delete notification
router.delete(
  "/delete/:id",
  verifyUser,
  validateRequest(notificationParamsSchema, "params"),
  deleteNotification
);
// router.get("/by/:id", verifyAdmin, fetchNotificationById);

module.exports = router;
