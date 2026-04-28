const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    module: { type: String, default: "" },
    page: { type: String, default: "" },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Open",
        "Assigned",
        "Working",
        "Fixed",
        "Testing",
        "Reopened",
        "Closed",
      ],
      default: "Open",
    },

    assignedTo: { type: String, default: "" },
    reportedBy: { type: String, required: true },
    payload: {
      type: String,
      default: "",
    },
    linkedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    attachments: [
      {
        originalName: String,
        fileName: String,
        filePath: String,
        mimeType: String,
        size: Number,
        uploadedBy: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    remarks: { type: String, default: "" },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Bug", bugSchema);
