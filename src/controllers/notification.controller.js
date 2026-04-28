const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
  const filter = {
    userName: req.user.name,
  };

  if (req.query.unread === "true") {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  const unreadCount = await Notification.countDocuments({
    userName: req.user.name,
    isRead: false,
  });

  res.json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userName: req.user.name,
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found.",
    });
  }

  res.json({
    success: true,
    data: notification,
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      userName: req.user.name,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  res.json({
    success: true,
    message: "All notifications marked as read.",
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.deleteOne({
    _id: req.params.id,
    userName: req.user.name,
  });

  res.json({
    success: true,
    message: "Notification deleted.",
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};