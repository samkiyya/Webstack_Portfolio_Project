
const express = require("express");
const {   fetchTotalSales,fetchOrdersWithBookInfo, getBestSellingBooksLast7Days,  getBestSellingBooksLastMonth, getBestSellingBooksLastYear, getBestSellingBooksThisMonth, getBestSellingBooksThisYear, getBestSellingBooksByDateRange, getSalesReportByBookId, getAverageSalesPrice, getSalesReportForLoggedInAuthor, getTotalSalesReportByAuthorId,   getTotalSpentByUsers, getTopBuyers, getTopSellersAuthors } = require("../controllers/bestSellController");
const { verifyAdmin, verifyUser } = require("../middlewares/auth");

const router = express.Router()

//router.post('/',verifyAdmin);
//router.put('/:id',verifyAdmin );
//router.get('/', );

router.get('/reports/bybookid/:id',verifyAdmin, getSalesReportByBookId);
router.get('/reports/author-bookid/:id',verifyUser, getSalesReportByBookId);
router.get('/reports/logged-author', verifyUser,getSalesReportForLoggedInAuthor);
router.get('/reports/total-byauthorid/:id',verifyAdmin,  getTotalSalesReportByAuthorId);

router.get('/reports/top-books',verifyAdmin,getTopBuyers);
router.get('/reports/top-sellers',verifyAdmin,getTopSellersAuthors);
router.get('/reports/top-buyer',verifyAdmin,getTotalSpentByUsers);

router.get('/reports/total',verifyAdmin,fetchTotalSales);
router.get('/reports/last7days',verifyAdmin,getBestSellingBooksLast7Days);
router.get('/reports/average',verifyAdmin,getAverageSalesPrice);
router.get('/reports/last-month',verifyAdmin, getBestSellingBooksLastMonth);
router.get('/reports/last-year',verifyAdmin, getBestSellingBooksLastYear);
router.get('/reports/this-month',verifyAdmin,getBestSellingBooksThisMonth );
router.get('/reports/this-year',verifyAdmin,getBestSellingBooksThisYear);
router.get('/reports/between',verifyAdmin, getBestSellingBooksByDateRange); 

router.post('/report/date-and-book',verifyAdmin,fetchOrdersWithBookInfo);


module.exports = router
