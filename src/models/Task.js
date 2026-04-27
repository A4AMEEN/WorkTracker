const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    page: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    workingType: {
      type: String,
      enum: ["Frontend", "Backend", "Both"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Working",
        "Done",
        "Backend Needed",
        "Testing",
        "Test Done",
        "Rework",
      ],
      default: "Pending",
    },
    testedBy: {
      type: String,
      default: "",
    },
    testRemarks: {
      type: String,
      default: "",
    },
    reworkCount: {
      type: Number,
      default: 0,
    },
    person: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    remarks: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      default: "",
    },
    attachments: [
  {
    originalName: String,
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,
    uploadedBy: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
]
  },
  { timestamps: true },
);

taskSchema.index({
  date: 1,
  status: 1,
  person: 1,
  module: 1,
  priority: 1,
  workingType: 1,
});

module.exports = mongoose.model("Task", taskSchema);
