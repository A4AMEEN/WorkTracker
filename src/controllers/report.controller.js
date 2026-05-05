const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const { toDateOnly } = require("../utils/dateUtils");

const getDateRange = (date) => {
  const start = new Date(`${date}T00:00:00.000`);
  const end = new Date(`${date}T23:59:59.999`);
  return { start, end };
};

const buildReportMatch = (query) => {
  const match = {};

  const mode = query.mode || "taskDate";

  if (query.date) {
    const { start, end } = getDateRange(query.date);

    if (mode === "completedOn") {
      match.completedAt = { $gte: start, $lte: end };
    } else if (mode === "both") {
      match.$or = [
        { date: query.date },
        { completedAt: { $gte: start, $lte: end } },
      ];
    } else {
      match.date = query.date;
    }
  } else if (query.from || query.to) {
    if (mode === "completedOn") {
      match.completedAt = {};
      if (query.from) match.completedAt.$gte = new Date(`${query.from}T00:00:00.000`);
      if (query.to) match.completedAt.$lte = new Date(`${query.to}T23:59:59.999`);
    } else {
      match.date = {};
      if (query.from) match.date.$gte = query.from;
      if (query.to) match.date.$lte = query.to;
    }
  }

  if (query.person && query.person !== "All") {
  const persons = String(query.person)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (persons.length) {
    match.person = { $in: persons };
  }
}
  if (query.module) match.module = query.module;
  if (query.status) match.status = query.status;

  return match;
};

const getSummaryReport = asyncHandler(async (req, res) => {
  const match = buildReportMatch(req.query);

  const [tasks, byPerson, byModule, byStatus, byDate] = await Promise.all([
    Task.find(match).sort({ completedAt: -1, date: -1, createdAt: -1 }),

    Task.aggregate([
      { $match: match },
      { $group: { _id: "$person", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    Task.aggregate([
      { $match: match },
      { $group: { _id: "$module", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    Task.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Task.aggregate([
      { $match: match },
      { $group: { _id: "$date", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      mode: req.query.mode || "taskDate",
      total: tasks.length,
      tasks,
      byPerson: byPerson.map((x) => ({ person: x._id, count: x.count })),
      byModule: byModule.map((x) => ({ module: x._id, count: x.count })),
      byStatus: byStatus.map((x) => ({ status: x._id, count: x.count })),
      byDate: byDate.map((x) => ({ date: x._id, count: x.count })),
    },
  });
});

const getDailyWhatsAppReport = asyncHandler(async (req, res) => {
  const date = req.query.date || toDateOnly();
  const mode = req.query.mode || "taskDate";

  const match = buildReportMatch({ ...req.query, date, mode });

  const tasks = await Task.find(match).sort({
    status: 1,
    person: 1,
    completedAt: -1,
    createdAt: -1,
  });

  const pending = tasks.filter((t) => t.status === "Pending");
  const working = tasks.filter((t) => t.status === "Working");
  const done = tasks.filter((t) => t.status === "Done" || t.status === "Test Done");
  const backend = tasks.filter((t) => t.status === "Backend Needed");
  const testing = tasks.filter((t) => t.status === "Testing");
  const rework = tasks.filter((t) => t.status === "Rework");

  const modeTitle =
    mode === "completedOn"
      ? "Tasks Completed On This Date"
      : mode === "both"
        ? "Tasks Dated This Day + Completed This Day"
        : "Tasks Dated This Day";

  const formatList = (title, list) => {
    if (!list.length) return `\n${title}: Nil`;

    return (
      `\n${title}:\n` +
      list
        .map((t, i) => {
          const completedText = t.completedAt
            ? ` | Completed: ${new Date(t.completedAt).toLocaleString()}`
            : "";

          return `${i + 1}. ${t.person} - ${t.module} / ${t.page}: ${t.description}${completedText}`;
        })
        .join("\n")
    );
  };

  const message = `📌 WorkTrack Daily Report
Date: ${date}
Mode: ${modeTitle}

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
      mode,
      modeTitle,
      summary: {
        total: tasks.length,
        done: done.length,
        pending: pending.length,
        working: working.length,
        testing: testing.length,
        backendNeeded: backend.length,
        rework: rework.length,
      },
      tasks,
      message,
    },
  });
});

module.exports = {
  getSummaryReport,
  getDailyWhatsAppReport,
};