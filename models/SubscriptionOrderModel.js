const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubscriptionOrder = sequelize.define('SubscriptionOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    totalPrice: {
      type: DataTypes.DECIMAL,
      
      allowNull: false,
    },

    receiptImage: {
      type: DataTypes.STRING,
     
  },


  subscriptionType: {
    type: DataTypes.ENUM('Monthly', 'Yearly'),
    allowNull: false,
},
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'APPROVED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
    reviewedBy: {
      type: DataTypes.TEXT,
      //allowNull: false,
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      //allowNull: false,
    },

  }, {
    tableName: 'subscription_orders',
  });

  module.exports = SubscriptionOrder;