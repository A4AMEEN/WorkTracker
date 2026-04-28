const Notification = require("../models/Notification");

const createNotification = async ({
  userName,
  title,
  message,
  type = "GENERAL",
  targetType = "General",
  targetId = null,
  createdBy = "",
}) => {
  if (!userName) return null;

  return Notification.create({
    userName,
    title,
    message,
    type,
    targetType,
    targetId,
    createdBy,
  });
};

module.exports = { createNotification };