
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
   
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    limitCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
  
}, {
    tableName: 'subscriptions',
});

module.exports = Subscription;