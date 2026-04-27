const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  console.log("\n🔐 LOGIN ATTEMPT ------------------");
  console.log("Username:", username);
  console.log("Password Entered:", password);

  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user) {
    console.log("❌ User NOT FOUND");
    return res.status(401).json({
      success: false,
      message: "Invalid username or password."
    });
  }

  const isMatch = await user.matchPassword(password);

  console.log("Stored Hash:", user.password); // hashed password
  console.log("Password Match:", isMatch);

  if (!isMatch) {
    console.log("❌ WRONG PASSWORD");
    return res.status(401).json({
      success: false,
      message: "Invalid username or password."
    });
  }

  console.log("✅ LOGIN SUCCESS:", user.username);

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role
    }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = {
  login,
  me
};
