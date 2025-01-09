const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Salesman = require('./salesManModel');

const SalesmanPayment = sequelize.define('SalesmanPayment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  salesmanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'salesmen', // Match the table name defined in Salesman model
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fromDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  toDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  numberOfUsers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'salesman_payments',
  timestamps: true,
});

// Associations
Salesman.hasMany(SalesmanPayment, { foreignKey: 'salesmanId' });
SalesmanPayment.belongsTo(Salesman, { foreignKey: 'salesmanId' });

module.exports = SalesmanPayment;
