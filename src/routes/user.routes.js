const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/user.controller");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.post("/", allowRoles("Admin"), createUser);
router.put("/:id", allowRoles("Admin"), updateUser);
router.delete("/:id", allowRoles("Admin"), deleteUser);

module.exports = router;
