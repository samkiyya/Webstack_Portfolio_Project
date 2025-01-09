const SalesmanPayment = require('../models//salesManPaymnetsModel');

const { Op } = require('sequelize'); 
// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { salesmanId, paymentStatus, amount, fromDate, toDate, numberOfUsers } = req.body;
    const payment = await SalesmanPayment.create({
      salesmanId, paymentStatus, amount, fromDate, toDate, numberOfUsers,
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await SalesmanPayment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await SalesmanPayment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, amount, fromDate, toDate, numberOfUsers } = req.body;
    const payment = await SalesmanPayment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    await payment.update({ paymentStatus, amount, fromDate, toDate, numberOfUsers });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await SalesmanPayment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    await payment.destroy();
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getSalesPaymentsByDateRange = async (req, res) => {
    const { startDate, endDate } = req.body;
  
    try {
      // Validate input
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Please provide both startDate and endDate' });
      }
  
      const payments = await SalesmanPayment.findAll({
        where: {
          fromDate: {
            [Op.gte]: new Date(startDate), // Payments starting from this date
          },
          toDate: {
            [Op.lte]: new Date(endDate), // Payments ending by this date
          },
        },
        include: [{ all: true, nested: true }], // Includes associated Salesman data
      });
  
      if (payments.length === 0) {
        return res.status(404).json({ message: 'No payments found in the given date range' });
      }
  
      res.status(200).json({ data: payments });
    } catch (error) {
      console.error('Error fetching sales payments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
