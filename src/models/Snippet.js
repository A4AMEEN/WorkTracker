const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    code: { type: String, required: true },
    language: {
      type: String,
      enum: ["TypeScript", "JavaScript", "HTML", "CSS", "SCSS", "C#", "SQL", "JSON", "Shell", "Other"],
      default: "JavaScript",
    },
    tags: [{ type: String }],
    module: { type: String, default: "" },
    page: { type: String, default: "" },
    isFavorite: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
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

snippetSchema.index({ language: 1, isFavorite: 1, createdAt: -1 });

module.exports = mongoose.model("Snippet", snippetSchema);
