
const express = require("express");
const { createSubscription, fetchSubscriptionOrders,deleteSubscription,updateSubscription, fetchSubscriptions, fetchSubscriptionById, fetchmySubscription } = require("../controllers/subscriptionController");
const { verifyAdmin, verifyUser } = require("../middlewares/auth");

const router = express.Router()

router.post('/',verifyAdmin,createSubscription);
router.put('/update/:id',verifyAdmin,updateSubscription );
router.get('/', fetchSubscriptions);
router.delete('/delete/:id',verifyAdmin, deleteSubscription);
router.get('/my/subscription',verifyUser, fetchmySubscription);
router.get('/by-id/:id',verifyAdmin, fetchSubscriptionById);

module.exports = router
