
const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { storeOrderImage } = require("../middlewares/imageupload");
const { purchaseSubscriptionOrder, updateSubscriptionOrderStatus, getAllSubscriptionOrders, getSubscriptionOrderById, findSubscriptionOrderByOrderNumber, getSubscriptionSalesReport, getSubscriptionOrdersByStatus, getSubscriptionSalesReportByDateRange } = require("../controllers/subOrder");
const { checkSubOrder } = require("../middlewares/payment");

const router = express.Router()

router.post('/purchase',verifyUser,checkSubOrder,storeOrderImage.single('receiptImage'),purchaseSubscriptionOrder );
router.put('/update-status/:id', verifyAdmin,updateSubscriptionOrderStatus);
router.get('/get-all', verifyAdmin,getAllSubscriptionOrders);
router.get('/by/:id', verifyAdmin,getSubscriptionOrderById);
router.get('/byorder-number/:orderNumber',verifyAdmin, findSubscriptionOrderByOrderNumber);
router.get('/reports',verifyAdmin,  getSubscriptionSalesReport);
router.get('/bystatus/:status', verifyAdmin, getSubscriptionOrdersByStatus);
router.get('/between',verifyAdmin,getSubscriptionSalesReportByDateRange );

module.exports = router





  