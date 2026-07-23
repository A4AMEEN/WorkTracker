const express = require("express");
const router = express.Router();

const {
  getSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  markUsed,
  deleteAttachment,
} = require("../controllers/snippet.controller");

const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.get("/", getSnippets);
router.get("/:id", getSnippet);
router.post("/", upload.array("attachments", 10), createSnippet);
router.put("/:id", upload.array("attachments", 10), updateSnippet);
router.delete("/:id", deleteSnippet);
router.patch("/:id/favorite", toggleFavorite);
router.patch("/:id/use", markUsed);
router.delete("/:id/attachments/:fileName", deleteAttachment);

module.exports = router;
