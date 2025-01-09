
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        
    },
    couponCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
  }, {
    tableName: 'coupons',
  });

  module.exports = Coupon;
