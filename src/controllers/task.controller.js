const Task = require("../models/Task");
const TaskHistory = require("../models/TaskHistory");
const asyncHandler = require("../utils/asyncHandler");
const { toDateOnly, getDayName } = require("../utils/dateUtils");
const { createNotification } = require("../utils/notify");
const carryForwardStatuses = [
  "Pending",
  "Working",
  "Backend Needed",
  "Testing",
  "Rework",
];

const addHistory = async ({
  task,
  field,
  oldVal = "",
  newVal = "",
  changedBy,
  remark = "",
}) => {
  await TaskHistory.create({
    taskId: task._id,
    taskDesc: task.description,
    field,
    oldVal: String(oldVal ?? ""),
    newVal: String(newVal ?? ""),
    changedBy,
    remark,
  });
};

const mapAttachments = (files = [], userName) => {
  return files.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path, // Cloudinary URL,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: userName,
  }));
};

const buildTaskFilter = (query) => {
  const filter = {};

  if (query.date) filter.date = query.date;
  if (query.person) filter.person = query.person;
  if (query.module) filter.module = query.module;
  if (query.page) filter.page = query.page;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.workingType) filter.workingType = query.workingType;

  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [
      { module: regex },
      { page: regex },
      { description: regex },
      { person: regex },
      { remarks: regex },
      { createdBy: regex },
    ];
  }

  return filter;
};

const getTasks = asyncHandler(async (req, res) => {
  const filter = buildTaskFilter(req.query);

  const sortBy = req.query.sortBy || "date";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ [sortBy]: sortDir, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

const getTodayTasks = asyncHandler(async (req, res) => {
  const today = toDateOnly();

  const tasks = await Task.find({
    $or: [
      { date: today },
      {
        date: { $lt: today },
        status: { $in: carryForwardStatuses },
      },
    ],
  }).sort({ status: 1, priority: -1, date: 1 });

  const data = tasks.map((task) => ({
    ...task.toObject(),
    isCarriedForward:
      task.date < today && carryForwardStatuses.includes(task.status),
  }));

  res.json({ success: true, data });
});

const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ person: req.user.name }).sort({
    date: -1,
    createdAt: -1,
  });

  res.json({ success: true, data: tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const date = req.body.date || toDateOnly();
  const attachments = mapAttachments(req.files || [], req.user.name);

  const finalDeadlineDate = req.body.deadlineDate || date;
  const finalDeadlineTime = req.body.deadlineTime || "";

  const deadlineAt =
    finalDeadlineDate && finalDeadlineTime
      ? new Date(`${finalDeadlineDate}T${finalDeadlineTime}:00`)
      : null;

  const task = await Task.create({
    date,
    day: getDayName(date),
    module: req.body.module,
    page: req.body.page,
    description: req.body.description,
    workingType: req.body.workingType,
    status: req.body.status || "Pending",
    person: req.body.person,
    priority: req.body.priority || "Medium",
    remarks: req.body.remarks || "",
    createdBy: req.user.name,
    updatedBy: req.user.name,
    deadlineDate: finalDeadlineTime ? finalDeadlineDate : "",
    deadlineTime: finalDeadlineTime,
    deadlineAt,
    estimatedHours: Number(req.body.estimatedHours || 0),

    attachments,
  });

  await createNotification({
  userName: task.person,
  title: "New task assigned",
  message: `${task.createdBy} assigned you a task: ${task.description}`,
  type: "TASK_ASSIGNED",
  targetType: "Task",
  targetId: task._id,
  createdBy: req.user.name,
});

  await addHistory({
    task,
    field: "created",
    changedBy: req.user.name,
    remark: "New task created",
  });

  if (attachments.length > 0) {
    await addHistory({
      task,
      field: "attachments",
      oldVal: "",
      newVal: `${attachments.length} file(s) uploaded`,
      changedBy: req.user.name,
      remark: "Attachment uploaded",
    });
  }

  res.status(201).json({ success: true, data: task });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  const editableFields = [
    "date",
    "module",
    "page",
    "description",
    "workingType",
    "status",
    "person",
    "priority",
    "remarks",
    "deadlineDate",
    "deadlineTime",
    "estimatedHours",
  ];

  for (const field of editableFields) {
    if (
      req.body[field] !== undefined &&
      String(task[field] ?? "") !== String(req.body[field] ?? "")
    ) {
      await addHistory({
        task,
        field,
        oldVal: task[field],
        newVal: req.body[field],
        changedBy: req.user.name,
        remark: req.body.changeRemark || "",
      });

      task[field] = req.body[field];
    }
  }

  if (req.body.date) {
    task.day = getDayName(req.body.date);
  }

  const newAttachments = mapAttachments(req.files || [], req.user.name);

  if (newAttachments.length > 0) {
    task.attachments = [...(task.attachments || []), ...newAttachments];

    await addHistory({
      task,
      field: "attachments",
      oldVal: "",
      newVal: `${newAttachments.length} file(s) uploaded`,
      changedBy: req.user.name,
      remark: "Attachment uploaded",
    });
  }
const finalDeadlineDate = task.deadlineDate || task.date;
const finalDeadlineTime = task.deadlineTime || "";

if (finalDeadlineTime) {
  task.deadlineDate = finalDeadlineDate;
  task.deadlineTime = finalDeadlineTime;
  task.deadlineAt = new Date(`${finalDeadlineDate}T${finalDeadlineTime}:00`);
} else {
  task.deadlineDate = "";
  task.deadlineTime = "";
  task.deadlineAt = null;
}

  task.updatedBy = req.user.name;
  await task.save();

  res.json({ success: true, data: task });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  const oldStatus = task.status;

  if (oldStatus !== status) {
    await addHistory({
      task,
      field: "status",
      oldVal: oldStatus,
      newVal: status,
      changedBy: req.user.name,
      remark: remark || "",
    });

    task.status = status;

    if (status === "Done" || status === "Test Done") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }
  }

  if (remark) {
    await addHistory({
      task,
      field: "remark",
      oldVal: task.remarks || "",
      newVal: remark,
      changedBy: req.user.name,
      remark,
    });

    task.remarks = remark;
  }

  task.updatedBy = req.user.name;
  await task.save();

  await createNotification({
    userName: task.person,
    title: "Task updated",
    message: `Task updated: ${task.description}`,
    type: "STATUS_UPDATE",
    targetType: "Task",
    targetId: task._id,
    createdBy: req.user.name,
  });

  res.json({ success: true, data: task });
});
const updateTestResult = asyncHandler(async (req, res) => {
  const { passed, remark } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  const oldStatus = task.status;

  if (passed) {
    task.status = "Test Done";
    task.testedBy = req.user.name;
    task.testRemarks = remark || "Testing passed";
  } else {
    task.status = "Rework";
    task.testedBy = req.user.name;
    task.testRemarks = remark || "Testing failed, rework needed";
    task.reworkCount = (task.reworkCount || 0) + 1;
    await createNotification({
  userName: task.person,
  title: "Rework assigned",
  message: `Testing failed. Rework needed: ${task.description}`,
  type: "REWORK",
  targetType: "Task",
  targetId: task._id,
  createdBy: req.user.name,
});
  }

  task.updatedBy = req.user.name;
  await task.save();

  await addHistory({
    task,
    field: "test-result",
    oldVal: oldStatus,
    newVal: task.status,
    changedBy: req.user.name,
    remark: task.testRemarks,
  });

  res.json({
    success: true,
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  await addHistory({
    task,
    field: "deleted",
    oldVal: task.status,
    newVal: "Deleted",
    changedBy: req.user.name,
    remark: "Task deleted",
  });

  await task.deleteOne();

  res.json({ success: true, message: "Task deleted." });
});

const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const { id, fileName } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  const attachment = (task.attachments || []).find(
    (file) => file.fileName === fileName,
  );

  if (!attachment) {
    return res.status(404).json({
      success: false,
      message: "Attachment not found.",
    });
  }

  task.attachments = task.attachments.filter(
    (file) => file.fileName !== fileName,
  );

  const filePath = path.join(process.cwd(), "uploads", "tasks", fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await addHistory({
    task,
    field: "attachments",
    oldVal: attachment.originalName,
    newVal: "Deleted",
    changedBy: req.user.name,
    remark: "Attachment deleted",
  });

  task.updatedBy = req.user.name;
  await task.save();

  res.json({
    success: true,
    message: "Attachment deleted.",
    data: task,
  });
});
module.exports = {
  getTasks,
  getTodayTasks,
  getMyTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTestResult,
  deleteTask,
  deleteTaskAttachment,
};
