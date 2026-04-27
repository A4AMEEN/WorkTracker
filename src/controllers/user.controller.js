const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ name: 1 });
  res.json({ success: true, data: users });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, username, password, role } = req.body;

  const exists = await User.findOne({ username: username.toLowerCase() });
  if (exists) {
    return res.status(400).json({ success: false, message: "Username already exists." });
  }

  const user = await User.create({ name, username, password, role });
  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    }
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const allowed = ["name", "role", "isActive"];
  const payload = {};

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  }).select("-password");

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  res.json({ success: true, message: "User deleted." });
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
