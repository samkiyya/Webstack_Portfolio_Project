const express = require("express");
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { storeOrderImage } = require("../middlewares/imageupload");
const { placeOrder, getReferalOrders, getOrdersForLoggedInUsers, getLast7DaysApprovedOrders, deleteUnApprovedOrderById, deleteOrderById, fetchApprovedOrdersByUserId, fetchOrdersByUserId, getOrderById, getAllOrders, getAllOrdersBystatus, getOrdersBetweenDay, getTodayOrders, getLast7DaysOrders, findOrderByOrderNumber, getApprovedOrdersForLoggedInUsers, getApprovedOrdersBetweenDay, ApproveOrUpdateOrderStatus, fetchApprovedOrdersWithUsersForBook } = require("../controllers/orderController");
const { isOrderBefore } = require("../middlewares/payment");
const { isTheRoleIsNotUser } = require("../middlewares/author");

const router = express.Router()

router.get('/get-all',verifyAdmin, getAllOrders);
router.get('/by-id/:id',verifyAdmin, getOrderById);
router.post('/purchase/', verifyUser,storeOrderImage.single('receiptImage'), placeOrder);
router.put('/update-status/:id', ApproveOrUpdateOrderStatus);
router.delete('/delete/:id',deleteOrderById );

router.get('/logged-user',verifyUser, getOrdersForLoggedInUsers );
router.get('/approved-logged-user',verifyUser, getApprovedOrdersForLoggedInUsers );
router.get('/for-book/:id',verifyAdmin, fetchApprovedOrdersWithUsersForBook);
router.get('/last7days-approved',verifyAdmin, getLast7DaysApprovedOrders );
router.delete('/delete-unapproved/:id',verifyAdmin,deleteUnApprovedOrderById );
router.get('/approved-byuser/:id',verifyAdmin, fetchApprovedOrdersByUserId ); 
router.get('/byuser/:id',verifyAdmin,fetchOrdersByUserId );
router.get('/bystatus/:status',verifyAdmin, getAllOrdersBystatus );
router.get('/between',verifyAdmin, getOrdersBetweenDay);
router.get('/approved-between',verifyAdmin, getApprovedOrdersBetweenDay);
router.get('/today', getTodayOrders);
router.get('/last7days', getLast7DaysOrders);
router.get('/ordernumber/:orderNumber',verifyAdmin, findOrderByOrderNumber);


router.post('/sales-referal-order', getReferalOrders);


module.exports = router
