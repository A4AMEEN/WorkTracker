const express = require("express");
const router = express.Router();

const {
  getBacklogs,
  createBacklog,
  updateBacklog,
  deleteBacklog,
  deleteBacklogAttachment,
} = require("../controllers/backlog.controller");

const { protect, allowRoles } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.get("/", getBacklogs);

router.post(
  "/",
  allowRoles("Admin", "Developer"),
  upload.array("attachments", 10),
  createBacklog
);

router.put(
  "/:id",
  allowRoles("Admin", "Developer"),
  upload.array("attachments", 10),
  updateBacklog
);

router.delete("/:id", allowRoles("Admin"), deleteBacklog);

router.delete(
  "/:id/attachments/:fileName",
  allowRoles("Admin", "Developer"),
  deleteBacklogAttachment
);

module.exports = router;
