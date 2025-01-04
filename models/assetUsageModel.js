const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssetUsage = sequelize.define('AssetUsage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      
    },
    pagesRead: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    totalTimeSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // In minutes
    },
    isIdle: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = AssetUsage;
