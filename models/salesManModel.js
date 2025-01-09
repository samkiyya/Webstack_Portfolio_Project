const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SaleMan = sequelize.define('SaleMan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referral_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'salesmen',
  timestamps: true,
});

module.exports = SaleMan;
