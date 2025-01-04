
const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { getSoldContentReport, getSoldContentReportByDateRange, getAllSoldContents, getSoldContentById, deleteSoldContent } = require("../controllers/soldContentController.js");
const { isAdmin } = require("../middlewares/isAdmin.js");

const router = express.Router()

//router.post('/',  verifyUser,);
//router.post('/', );
router.get('/between', verifyAdmin,  getSoldContentReportByDateRange);
router.get('/get-totals',verifyAdmin, getSoldContentReport);
router.get('/get-all', verifyAdmin, getAllSoldContents );
router.get('/by/:id',verifyAdmin, getSoldContentById);
router.delete('/delete/:id',verifyAdmin,isAdmin, deleteSoldContent );

module.exports = router
