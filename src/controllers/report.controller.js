const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const getSummaryReport = asyncHandler(async (req, res) => {
  const match = {};

  if (req.query.from || req.query.to) {
    match.date = {};
    if (req.query.from) match.date.$gte = req.query.from;
    if (req.query.to) match.date.$lte = req.query.to;
  }

  if (req.query.person) match.person = req.query.person;
  if (req.query.module) match.module = req.query.module;
  if (req.query.status) match.status = req.query.status;

  const [tasks, byPerson, byModule, byStatus, byDate] = await Promise.all([
    Task.find(match).sort({ date: -1 }),
    Task.aggregate([{ $match: match }, { $group: { _id: "$person", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Task.aggregate([{ $match: match }, { $group: { _id: "$module", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Task.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: match }, { $group: { _id: "$date", count: { $sum: 1 } } }, { $sort: { _id: -1 } }])
  ]);

  res.json({
    success: true,
    data: {
      total: tasks.length,
      tasks,
      byPerson: byPerson.map((x) => ({ person: x._id, count: x.count })),
      byModule: byModule.map((x) => ({ module: x._id, count: x.count })),
      byStatus: byStatus.map((x) => ({ status: x._id, count: x.count })),
      byDate: byDate.map((x) => ({ date: x._id, count: x.count }))
    }
  });
});

const getDailyWhatsAppReport = asyncHandler(async (req, res) => {
  const date = req.query.date || toDateOnly();

  const tasks = await Task.find({ date }).sort({ person: 1 });

  const pending = tasks.filter(t => t.status === "Pending");
  const working = tasks.filter(t => t.status === "Working");
  const done = tasks.filter(t => t.status === "Done" || t.status === "Test Done");
  const backend = tasks.filter(t => t.status === "Backend Needed");
  const testing = tasks.filter(t => t.status === "Testing");
  const rework = tasks.filter(t => t.status === "Rework");

  const formatList = (title, list) => {
    if (!list.length) return `\n${title}: Nil`;
    return `\n${title}:\n` + list.map((t, i) =>
      `${i + 1}. ${t.person} - ${t.module} / ${t.page}: ${t.description}`
    ).join("\n");
  };

  const message =
`📌 WorkTrack Daily Report
Date: ${date}

Total Tasks: ${tasks.length}
✅ Done: ${done.length}
⏳ Pending: ${pending.length}
🔵 Working: ${working.length}
🧪 Testing: ${testing.length}
🔴 Backend Needed: ${backend.length}
🔁 Rework: ${rework.length}

${formatList("✅ Completed", done)}

${formatList("🔵 Working", working)}

${formatList("⏳ Pending", pending)}

${formatList("🧪 Testing", testing)}

${formatList("🔁 Rework", rework)}

${formatList("🔴 Backend Needed", backend)}

Regards,
WorkTrack`;

  res.json({
    success: true,
    data: {
      date,
      summary: {
        total: tasks.length,
        done: done.length,
        pending: pending.length,
        working: working.length,
        testing: testing.length,
        backendNeeded: backend.length,
        rework: rework.length
      },
      message
    }
  });
});
module.exports = {
  getSummaryReport,
  getDailyWhatsAppReport
};
