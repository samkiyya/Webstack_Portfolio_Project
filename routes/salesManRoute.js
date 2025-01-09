const express = require('express');
const {
  createSalesman,
  getAllSalesmen,
  getSalesmanById,
  updateSalesmanById,
  deleteSalesmanById,
  getUsersBySalesman,
  loginSalesman,
} = require('../controllers/salesManController');

const router = express.Router();

// CRUD routes
router.post('/', createSalesman);
router.get('/', getAllSalesmen);
router.get('/:id', getSalesmanById);
router.put('/:id', updateSalesmanById);
router.delete('/:id', deleteSalesmanById);

// Salesman-specific routes
router.get('/:id/users', getUsersBySalesman);
router.post('/login', loginSalesman);

module.exports = router;
