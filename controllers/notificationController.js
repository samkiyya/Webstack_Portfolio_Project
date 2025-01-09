const Notification = require("../models/NotificationModel");
const { getPagination, getPagingData } = require("../utils/pagination");

const getMyNotifications = async (req, res) => {
  try {
    const { page, size, type, isRead } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = { user_id: req.user.id };
    if (type) whereClause.type = type;
    if (typeof isRead === "boolean") whereClause.isRead = isRead;

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(getPagingData(notifications, page, limit));
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch notifications",
    });
  }
};

const getMyUnreadNotifications = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const notifications = await Notification.findAndCountAll({
      where: {
        user_id: req.user.id,
        isRead: false,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(getPagingData(notifications, page, limit));
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch unread notifications",
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to mark notification as read",
    });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const { page, size, type } = req.query;
    const { limit, offset } = getPagination(page, size);

    const whereClause = {};
    if (type) whereClause.type = type;

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: ["User"],
    });

    return res.status(200).json(getPagingData(notifications, page, limit));
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch notifications",
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    await notification.destroy();
    return res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete notification",
    });
  }
};

module.exports = {
  getMyNotifications,
  getMyUnreadNotifications,
  markAsRead,
  getAllNotifications,
  deleteNotification,
};
