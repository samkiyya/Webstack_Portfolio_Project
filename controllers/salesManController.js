const SaleMan = require('../models/salesManModel');
const User = require('../models/Usermodel'); // Assuming the User model exists
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Create a new salesman
exports.createSalesman = async (req, res) => {
  const { fname, lname, phone, email, password, referral_code } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newSalesman = await SaleMan.create({
      fname,
      lname,
      phone,
      email,
      password: hashedPassword,
      referral_code,
    });
    res.status(201).json({ message: 'Salesman created successfully', newSalesman });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all salesmen
exports.getAllSalesmen = async (req, res) => {
  try {
    const salesmen = await SaleMan.findAll();
    res.status(200).json(salesmen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific salesman by ID
exports.getSalesmanById = async (req, res) => {
  const { id } = req.params;
  try {
    const salesman = await SaleMan.findByPk(id);
    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }
    res.status(200).json(salesman);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a salesman by ID
exports.updateSalesmanById = async (req, res) => {
  const { id } = req.params;
  const { fname, lname, phone, email, password, referral_code } = req.body;
  try {
    const salesman = await SaleMan.findByPk(id);
    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    await salesman.update({
      fname: fname || salesman.fname,
      lname: lname || salesman.lname,
      phone: phone || salesman.phone,
      email: email || salesman.email,
      password: hashedPassword || salesman.password,
      referral_code: referral_code || salesman.referral_code,
    });

    res.status(200).json({ message: 'Salesman updated successfully', salesman });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a salesman by ID
exports.deleteSalesmanById = async (req, res) => {
  const { id } = req.params;
  try {
    const salesman = await SaleMan.findByPk(id);
    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }
    await salesman.destroy();
    res.status(200).json({ message: 'Salesman deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get users registered by a salesman and count
exports.getUsersBySalesman = async (req, res) => {
  const { id } = req.params;
  try {
    const salesman = await SaleMan.findByPk(id);
    if (!salesman) {
      return res.status(404).json({ message: 'Salesman not found' });
    }

    const users = await User.findAll({ where: { referalCode: salesman.referral_code } });
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Salesman login
exports.loginSalesman = async (req, res) => {
  const { email, password } = req.body;
  try {
    const salesman = await SaleMan.findOne({ where: { email } });
    if (!salesman) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, salesman.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: salesman.id, email: salesman.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
