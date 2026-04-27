const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Task = require("../models/Task");
const TaskHistory = require("../models/TaskHistory");
const { toDateOnly, getDayName } = require("../utils/dateUtils");

dotenv.config();

const users = [
  { name: "Ameen", username: "ameen", password: "admin123", role: "Admin" },
  { name: "Ansari", username: "ansari", password: "dev123", role: "Developer" },
  { name: "Kaviya", username: "kaviya", password: "dev123", role: "Developer" },
  { name: "Rajeena", username: "rajeena", password: "dev123", role: "Developer" },
  { name: "Rohan", username: "rohan", password: "dev123", role: "Viewer" }
];

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateOnly(d);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Task.deleteMany();
    await TaskHistory.deleteMany();

    await User.insertMany(users);

    const today = toDateOnly();
    const yesterday = addDays(-1);
    const twoDaysAgo = addDays(-2);

    const tasks = await Task.insertMany([
      {
        date: today,
        day: getDayName(today),
        module: "Procurement",
        page: "Purchase Order Page",
        description: "Add approval button to PO form",
        workingType: "Frontend",
        status: "Working",
        person: "Ansari",
        priority: "High",
        remarks: "Design ready",
        createdBy: "Ameen",
        updatedBy: "Ameen"
      },
      {
        date: today,
        day: getDayName(today),
        module: "Inventory",
        page: "Stock List",
        description: "Fix pagination issue on stock list",
        workingType: "Frontend",
        status: "Pending",
        person: "Kaviya",
        priority: "Medium",
        remarks: "",
        createdBy: "Ameen",
        updatedBy: "Ameen"
      },
      {
        date: yesterday,
        day: getDayName(yesterday),
        module: "Sales",
        page: "Invoice Page",
        description: "API integration for invoice generation",
        workingType: "Backend",
        status: "Backend Needed",
        person: "Rohan",
        priority: "Urgent",
        remarks: "Waiting for API docs",
        createdBy: "Ansari",
        updatedBy: "Ansari"
      },
      {
        date: yesterday,
        day: getDayName(yesterday),
        module: "HR",
        page: "Employee Portal",
        description: "Add export to Excel for attendance",
        workingType: "Both",
        status: "Done",
        person: "Ameen",
        priority: "Low",
        remarks: "Completed and tested",
        createdBy: "Ameen",
        updatedBy: "Ameen"
      },
      {
        date: twoDaysAgo,
        day: getDayName(twoDaysAgo),
        module: "Procurement",
        page: "Vendor List",
        description: "Search filter by vendor category",
        workingType: "Frontend",
        status: "Pending",
        person: "Rajeena",
        priority: "Medium",
        remarks: "",
        createdBy: "Ameen",
        updatedBy: "Ameen"
      }
    ]);

    await TaskHistory.insertMany([
      {
        taskId: tasks[0]._id,
        taskDesc: tasks[0].description,
        field: "status",
        oldVal: "Pending",
        newVal: "Working",
        changedBy: "Ansari",
        remark: ""
      },
      {
        taskId: tasks[3]._id,
        taskDesc: tasks[3].description,
        field: "status",
        oldVal: "Working",
        newVal: "Done",
        changedBy: "Ameen",
        remark: "Completed and tested"
      }
    ]);

    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
