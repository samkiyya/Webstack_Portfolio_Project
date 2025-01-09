const express = require('express');
const router = express.Router();
const salesmanPaymentController = require('../controllers/salesManPaymentsController');

// CRUD routes
router.post('/', salesmanPaymentController.createPayment);
router.get('/', salesmanPaymentController.getAllPayments);
router.get('/:id', salesmanPaymentController.getPaymentById);
router.put('/:id', salesmanPaymentController.updatePayment);
router.delete('/:id', salesmanPaymentController.deletePayment);

// Report routes
router.post('/report', salesmanPaymentController.getSalesPaymentsByDateRange);


module.exports = router;
