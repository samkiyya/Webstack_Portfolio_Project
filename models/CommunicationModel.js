const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Communication = sequelize.define('Communication', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceCharge: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    reviewedBy: {
      type: DataTypes.TEXT,
      //allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      //allowNull: false,
    },
    isAgreed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
  }, {
    tableName: 'communications',
  });

  module.exports = Communication