const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubscriptionTier = sequelize.define('SubscriptionTier', {
  tier_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  monthly_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  annual_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  content_type: {
    type: DataTypes.ENUM('books', 'audio_books', 'exclusive_content'),
    allowNull: false,
  },
  benefit_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = SubscriptionTier;
