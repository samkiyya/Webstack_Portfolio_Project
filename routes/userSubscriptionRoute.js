const express = require('express');
const router = express.Router();
const { verifyUser, verifyAdmin } = require("../middlewares/auth");
const { storeOrderImage } = require("../middlewares/imageupload");
const subscriptionTierController = require('../controllers/subscriptionTierController');
const subscriptionController = require('../controllers/userSubscriptionController');

// Subscription Tier Routes
router.post('/tiers', subscriptionTierController.createSubscriptionTier);
router.get('/tiers', subscriptionTierController.getAllSubscriptionTiers);
router.get('/tiers/:id', subscriptionTierController.getSubscriptionTierById);
router.put('/tiers/:id', subscriptionTierController.updateSubscriptionTier);
router.delete('/tiers/:id', subscriptionTierController.deleteSubscriptionTier);

// Subscription Routes
router.post('/', storeOrderImage.single('receiptImage'),verifyUser, subscriptionController.createSubscription);

router.get('/', subscriptionController.getAllSubscriptions);
router.post('/all', subscriptionController.generateSubscriptionRevenueReport);
router.get('/:id', subscriptionController.getSubscriptionById);
router.put('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);
router.get('/subscription', subscriptionController.generateSubscriptionRevenueReport);

module.exports = router;
