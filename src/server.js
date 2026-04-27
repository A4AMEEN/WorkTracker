const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/User");

const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
  console.log("DB Connected");

  // ✅ Fetch users
  const users = await User.find().select("-password");

  console.log("\n👥 USERS IN DATABASE:\n");

  if (users.length === 0) {
    console.log("❌ No users found");
  } else {
    console.table(
      users.map((u) => ({
        name: u.name,
        username: u.username,
        role: u.role,
        active: u.isActive,
      }))
    );
  }

  app.listen(PORT, () => {
    console.log(`🚀 WorkTrack API running on port ${PORT}`);
  });
});