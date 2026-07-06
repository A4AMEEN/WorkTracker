const mongoose = require("mongoose");

const backlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    module: { type: String, default: "" },
    page: { type: String, default: "" },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
    fromUser: { type: String, default: "" },
    remarks: { type: String, default: "" },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Backlog", backlogSchema);
