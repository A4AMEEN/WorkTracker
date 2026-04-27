const mongoose = require("mongoose");

const taskHistorySchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    taskDesc: {
      type: String,
      default: ""
    },
    field: {
      type: String,
      required: true
    },
    oldVal: {
      type: String,
      default: ""
    },
    newVal: {
      type: String,
      default: ""
    },
    changedBy: {
      type: String,
      required: true
    },
    remark: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

taskHistorySchema.index({ taskId: 1, changedBy: 1, createdAt: -1 });

module.exports = mongoose.model("TaskHistory", taskHistorySchema);
