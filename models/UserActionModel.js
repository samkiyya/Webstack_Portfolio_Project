
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserInteraction = sequelize.define('UserInteraction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
   
    actionType: {
        type: DataTypes.ENUM('purchase', 'read', 'subscribe'),
        allowNull: false,
    },
 
}, {
    tableName: 'user_interactions',
});

module.exports = UserInteraction;