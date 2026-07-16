const express = require("express");
const {
  getTasks,
  getTodayTasks,
  getMyTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  approveTask,
  reworkTask,
  updateTestResult,
  completeSubtask,
  deleteTaskAttachment,
  deleteTask,
} = require("../controllers/task.controller");

const { protect, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.get("/today", getTodayTasks);
router.get("/my-tasks", getMyTasks);

router.post(
  "/",
  allowRoles("Admin", "Developer"),
  upload.array("attachments", 10),
  createTask
);

router.put(
  "/:id",
  allowRoles("Admin", "Developer"),
  upload.array("attachments", 10),
  updateTask
);

router.patch("/:id/status", allowRoles("Admin", "Developer"), updateTaskStatus);
router.patch("/:id/approve", allowRoles("Admin", "Developer"), approveTask);
router.patch("/:id/rework", allowRoles("Admin", "Developer"), reworkTask);
router.patch("/:id/test-result", allowRoles("Admin", "Developer"), updateTestResult);
router.patch("/:id/subtasks/:subtaskId", allowRoles("Admin", "Developer"), completeSubtask);
router.delete(
  "/:id/attachments/:fileName",
  allowRoles("Admin", "Developer"),
  deleteTaskAttachment
);
router.delete("/:id", allowRoles("Admin"), deleteTask);

module.exports = router;
