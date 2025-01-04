const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserActivity = sequelize.define('UserActivity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',  // Assuming 'Users' is the name of the users table
            key: 'id',
        },
    },
    actionType: {
        type: DataTypes.ENUM('BOOK_PURCHASE', 'BOOK_READ', 'SUBSCRIPTION', 'BOOK_RATING', 'BOOK_REVIEW'),
        allowNull: false,
    },
    actionDetails: {
        type: DataTypes.JSON,  // Use JSON instead of JSONB for MariaDB
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,  // Replace DATETIME with DATE if necessary, and use backticks in SQL
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('COMPLETED', 'PENDING', 'FAILED'),
        defaultValue: 'COMPLETED',
    },
}, {
    tableName: 'user_activities',
    timestamps: false,
});

module.exports = UserActivity;
