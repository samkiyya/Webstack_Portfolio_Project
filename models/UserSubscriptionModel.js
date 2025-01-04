const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const SubscriptionTier = require('./subscriptionTriesModel');
const User = require('./Usermodel'); // Assumes you have a User model

const UserSubscription = sequelize.define('UserSubscription', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tier_id: {
    type: DataTypes.INTEGER,
    references: {
      model: SubscriptionTier,
      key: 'id',
    },
  },
  receiptImagePath: {
    type: DataTypes.STRING,
    allowNull: false,
},
bankName: {
  type: DataTypes.STRING,
  allowNull: false,
},
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  approval_status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending',
  },
}, {
  timestamps: true,
});

// Define Associations
SubscriptionTier.hasMany(UserSubscription, { foreignKey: 'tier_id', as: 'subscriptions' });
UserSubscription.belongsTo(SubscriptionTier, { foreignKey: 'tier_id', as: 'tier' });

module.exports = UserSubscription;
