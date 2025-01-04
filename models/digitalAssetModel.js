const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DigitalAsset = sequelize.define('DigitalAsset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'Book', 'Video', 'PDF'
    },
  
});

module.exports = DigitalAsset;
