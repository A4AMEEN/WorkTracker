const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");

const mapAttachments = (files = [], userName) => {
  return files.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename || file.public_id || file.originalname,
    filePath: file.path || file.secure_url,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: userName,
  }));
};

const getSnippets = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.language) filter.language = req.query.language;
  if (req.query.module) filter.module = req.query.module;
  if (req.query.isFavorite === "true") filter.isFavorite = true;

  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");
    filter.$or = [
      { title: regex },
      { description: regex },
      { code: regex },
      { tags: regex },
      { instructions: regex },
    ];
  }

  if (req.query.tags) {
    const tagList = req.query.tags.split(",").map((t) => new RegExp(t.trim(), "i"));
    filter.tags = { $in: tagList };
  }

  let sort = { createdAt: -1 };
  if (req.query.sort === "oldest") sort = { createdAt: 1 };
  if (req.query.sort === "most-used") sort = { usageCount: -1 };
  if (req.query.sort === "az") sort = { title: 1 };

  const snippets = await Snippet.find(filter).sort(sort);

  res.json({ success: true, data: snippets });
});

const getSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet) {
    return res.status(404).json({ success: false, message: "Snippet not found" });
  }

  res.json({ success: true, data: snippet });
});

const createSnippet = asyncHandler(async (req, res) => {
  const attachments = mapAttachments(req.files || [], req.user.name);

  let tags = [];
  if (req.body.tags) {
    try {
      tags = typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags;
    } catch (_) {
      tags = [];
    }
  }

  const snippet = await Snippet.create({
    title: req.body.title,
    description: req.body.description || "",
    instructions: req.body.instructions || "",
    code: req.body.code,
    language: req.body.language || "JavaScript",
    tags,
    module: req.body.module || "",
    page: req.body.page || "",
    isFavorite: req.body.isFavorite === "true" || req.body.isFavorite === true,
    createdBy: req.user.name,
    attachments,
  });

  res.status(201).json({ success: true, data: snippet });
});

const updateSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet) {
    return res.status(404).json({ success: false, message: "Snippet not found" });
  }

  const editableFields = [
    "title",
    "description",
    "instructions",
    "code",
    "language",
    "module",
    "page",
    "isFavorite",
  ];

  for (const field of editableFields) {
    if (req.body[field] !== undefined) {
      if (field === "isFavorite") {
        snippet[field] = req.body[field] === "true" || req.body[field] === true;
      } else {
        snippet[field] = req.body[field];
      }
    }
  }

  if (req.body.tags !== undefined) {
    try {
      snippet.tags = typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags;
    } catch (_) {}
  }

  if (req.files?.length) {
    const newAttachments = mapAttachments(req.files, req.user.name);
    snippet.attachments.push(...newAttachments);
  }

  await snippet.save();

  res.json({ success: true, data: snippet });
});

const deleteSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findByIdAndDelete(req.params.id);

  if (!snippet) {
    return res.status(404).json({ success: false, message: "Snippet not found" });
  }

  res.json({ success: true, message: "Snippet deleted" });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet) {
    return res.status(404).json({ success: false, message: "Snippet not found" });
  }

  snippet.isFavorite = !snippet.isFavorite;
  await snippet.save();

  res.json({ success: true, data: snippet });
});

const markUsed = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findByIdAndUpdate(
    req.params.id,
    { $inc: { usageCount: 1 } },
    { new: true }
  );

  if (!snippet) {
    return res.status(404).json({ success: false, message: "Snippet not found" });
  }

  res.json({ success: true, data: snippet });
});

const deleteAttachment = asyncHandler(async (req, res) => {
  const { id, fileName } = req.params;
  const snippet = await Snippet.findById(id);

  if (!snippet) {
    return res.status(404).json({ success: false, message: "Snippet not found" });
  }

  snippet.attachments = snippet.attachments.filter(
    (file) => file.fileName !== fileName
  );

  await snippet.save();

  res.json({ success: true, message: "Attachment deleted", data: snippet });
});

module.exports = {
  getSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  markUsed,
  deleteAttachment,
};
