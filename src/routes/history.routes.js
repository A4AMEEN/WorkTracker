const express = require("express");
const { getHistory } = require("../controllers/history.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getHistory);

module.exports = router;
