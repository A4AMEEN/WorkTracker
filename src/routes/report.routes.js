const express = require("express");
const { getSummaryReport,getDailyWhatsAppReport } = require("../controllers/report.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/summary", getSummaryReport);
router.get("/daily", getDailyWhatsAppReport);
module.exports = router;
