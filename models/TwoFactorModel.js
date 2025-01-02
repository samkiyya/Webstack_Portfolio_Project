const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TwoFactorAuth = sequelize.define('TwoFactorAuth', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
   
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    codeExpiration: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'two_factor',
});

module.exports = TwoFactorAuth