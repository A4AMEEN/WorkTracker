const Task = require("../models/Task");
const TaskHistory = require("../models/TaskHistory");
const asyncHandler = require("../utils/asyncHandler");
const { toDateOnly } = require("../utils/dateUtils");

const carryForwardStatuses = ["Pending", "Working", "Backend Needed"];

const getDashboard = asyncHandler(async (req, res) => {
  const today = toDateOnly();

  const [
    total,
    todayTasks,
    pending,
    working,
    done,
    backendNeeded,
    personWise,
    moduleWise,
    priorityWise,
    recentActivity
  ] = await Promise.all([
    Task.countDocuments(),
    Task.countDocuments({
      $or: [
        { date: today },
        { date: { $lt: today }, status: { $in: carryForwardStatuses } }
      ]
    }),
    Task.countDocuments({ status: "Pending" }),
    Task.countDocuments({ status: "Working" }),
    Task.countDocuments({ status: "Done" }),
    Task.countDocuments({ status: "Backend Needed" }),
    Task.aggregate([{ $group: { _id: "$person", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Task.aggregate([{ $group: { _id: "$module", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    TaskHistory.find().sort({ createdAt: -1 }).limit(10)
  ]);

  res.json({
    success: true,
    data: {
      cards: {
        total,
        todayTasks,
        pending,
        working,
        done,
        backendNeeded
      },
      personWise: personWise.map((x) => ({ person: x._id, count: x.count })),
      moduleWise: moduleWise.map((x) => ({ module: x._id, count: x.count })),
      priorityWise: priorityWise.map((x) => ({ priority: x._id, count: x.count })),
      recentActivity
    }
  });
});

module.exports = {
  getDashboard
};
