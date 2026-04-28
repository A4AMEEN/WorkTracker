const express = require("express");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;