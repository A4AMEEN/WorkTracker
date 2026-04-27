const express = require("express");
const { getDashboard } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getDashboard);

module.exports = router;
