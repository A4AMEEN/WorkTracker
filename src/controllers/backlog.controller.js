const Backlog = require("../models/backlog");

exports.getBacklogs = async (req, res) => {
  const backlogs = await Backlog.find().sort({ createdAt: -1 });
  res.json({ success: true, data: backlogs });
};

exports.createBacklog = async (req, res) => {
  const attachments = (req.files || []).map((file) => ({
    originalName: file.originalname,
    fileName: file.filename || file.public_id || file.originalname,
    filePath: file.path || file.secure_url,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: req.user.name,
  }));

  const backlog = await Backlog.create({
    ...req.body,
    createdBy: req.user.name,
    attachments,
  });

  res.status(201).json({ success: true, data: backlog });
};

exports.updateBacklog = async (req, res) => {
  const backlog = await Backlog.findById(req.params.id);

  if (!backlog) {
    return res.status(404).json({ success: false, message: "Backlog not found" });
  }

  Object.assign(backlog, req.body);

  if (req.files?.length) {
    const newFiles = req.files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename || file.public_id || file.originalname,
      filePath: file.path || file.secure_url,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user.name,
    }));
    backlog.attachments.push(...newFiles);
  }

  await backlog.save();
  res.json({ success: true, data: backlog });
};

exports.deleteBacklog = async (req, res) => {
  await Backlog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Backlog deleted" });
};

exports.deleteBacklogAttachment = async (req, res) => {
  const { id, fileName } = req.params;
  const backlog = await Backlog.findById(id);

  if (!backlog) {
    return res.status(404).json({ success: false, message: "Backlog not found" });
  }

  backlog.attachments = backlog.attachments.filter(
    (file) => file.fileName !== fileName
  );

  await backlog.save();
  res.json({ success: true, message: "Attachment deleted", data: backlog });
};
