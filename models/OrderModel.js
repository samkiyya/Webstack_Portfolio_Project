const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    price: {
      type: DataTypes.DECIMAL,
      
      allowNull: false,
    },
    receiptImagePath: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
},
type: {
  type: DataTypes.STRING,
  allowNull: false,
},
transactionNumber: {
  type: DataTypes.STRING,
  allowNull: false,
},
  serviceCharged: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
},
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    //allowNull: false,
  },

    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'APPROVED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
    reviewedBy: {
      type: DataTypes.TEXT,
      //allowNull: false,
    },
  }, {
    tableName: 'orders',
  });

  module.exports = Order;