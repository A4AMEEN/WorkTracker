const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const upload = require("./middleware/upload");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
const historyRoutes = require("./routes/history.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");

const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WorkTrack API Running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorHandler);

module.exports = app;
