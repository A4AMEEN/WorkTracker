const TaskHistory = require("../models/TaskHistory");
const asyncHandler = require("../utils/asyncHandler");

const getHistory = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.person) filter.changedBy = req.query.person;

  if (req.query.taskId) filter.taskId = req.query.taskId;

  if (req.query.date) {
    const start = new Date(`${req.query.date}T00:00:00`);
    const end = new Date(`${req.query.date}T23:59:59.999`);
    filter.createdAt = { $gte: start, $lte: end };
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 100, 300);
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    TaskHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    TaskHistory.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: history,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  getHistory
};
