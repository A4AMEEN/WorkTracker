const Bug = require("../models/bugs");
const Task = require("../models/Task");
const { createNotification } = require("../utils/notify");
// GET ALL
exports.getBugs = async (req, res) => {
  const bugs = await Bug.find().sort({ createdAt: -1 });
  res.json({ success: true, data: bugs });
};

// CREATE
exports.createBug = async (req, res) => {
  const attachments = (req.files || []).map(file => ({
    originalName: file.originalname,
    fileName: file.filename,
    filePath: `/uploads/tasks/${file.filename}`,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: req.user.name,
  }));

  const bug = await Bug.create({
    ...req.body,
    reportedBy: req.user.name,
    attachments,
  });
  if (bug.assignedTo) {
  await createNotification({
    userName: bug.assignedTo,
    title: "Bug assigned",
    message: `${bug.reportedBy} assigned you a bug: ${bug.title}`,
    type: "BUG_ASSIGNED",
    targetType: "Bug",
    targetId: bug._id,
    createdBy: req.user.name,
  });
}

  res.status(201).json({ success: true, data: bug });
};

// UPDATE
exports.updateBug = async (req, res) => {
  const bug = await Bug.findById(req.params.id);

  if (!bug) return res.status(404).json({ message: "Bug not found" });

  Object.assign(bug, req.body);

  if (req.files?.length) {
    const newFiles = req.files.map(file => ({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `/uploads/tasks/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user.name,
    }));

    bug.attachments.push(...newFiles);
  }

  await bug.save();

  res.json({ success: true, data: bug });
};

// STATUS UPDATE
exports.updateBugStatus = async (req, res) => {
  const bug = await Bug.findById(req.params.id);

  if (!bug) return res.status(404).json({ message: "Bug not found" });

  bug.status = req.body.status;
  bug.remarks = req.body.remark || "";

  await bug.save();

  res.json({ success: true, data: bug });
};

// DELETE
exports.deleteBug = async (req, res) => {
  await Bug.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// 🔥 CONVERT BUG → TASK
exports.convertToTask = async (req, res) => {
  const bug = await Bug.findById(req.params.id);

  if (!bug) return res.status(404).json({ message: "Bug not found" });

  const task = await Task.create({
    date: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),

    module: bug.module,
    page: bug.page,
    description: `🐞 BUG: ${bug.title}\n\n${bug.description}`,

    workingType: "Both",
    status: "Pending",
    person: req.body.assignTo || bug.assignedTo,
    priority: bug.severity === "Critical" ? "Urgent" : "High",

    createdBy: req.user.name,
    updatedBy: req.user.name,

    attachments: bug.attachments,
  });

  bug.linkedTaskId = task._id;
  bug.status = "Assigned";

  await bug.save();
  await createNotification({
  userName: task.person,
  title: "Bug converted to task",
  message: `Bug converted and assigned to you: ${bug.title}`,
  type: "BUG_TO_TASK",
  targetType: "Task",
  targetId: task._id,
  createdBy: req.user.name,
});

  res.json({
    success: true,
    message: "Bug converted to Task",
    task,
  });
};