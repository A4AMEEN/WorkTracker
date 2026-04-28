const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "BUG_ASSIGNED",
        "DEADLINE_SOON",
        "TASK_OVERDUE",
        "BUG_TO_TASK",
        "REWORK",
        "STATUS_UPDATE",
        "GENERAL",
      ],
      default: "GENERAL",
    },

    targetType: {
      type: String,
      enum: ["Task", "Bug", "General"],
      default: "General",
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userName: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);