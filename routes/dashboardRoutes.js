const express = require("express");
const { getRowCounts } = require("../controllers/dashboardController");
const { verifyAdmin, verifyUser } = require("../middlewares/auth");

const router = express.Router();

// Admin-only route
router.get('/admin',  getRowCounts);

// User-only route
router.get('/author', verifyUser, getRowCounts);

module.exports = router;
