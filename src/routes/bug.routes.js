const express = require("express");
const router = express.Router();

const {
  getBugs,
  createBug,
  updateBug,
  updateBugStatus,
  deleteBug,
  convertToTask,
} = require("../controllers/bug.controller");

const { protect, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.get("/", getBugs);

router.post(
  "/",
  allowRoles("Admin", "Developer"),
  upload.array("attachments", 10),
  createBug
);

router.put(
  "/:id",
  allowRoles("Admin", "Developer"),
  upload.array("attachments", 10),
  updateBug
);

router.patch("/:id/status", updateBugStatus);

router.post("/:id/convert-to-task", convertToTask);

router.delete("/:id", allowRoles("Admin"), deleteBug);

module.exports = router;