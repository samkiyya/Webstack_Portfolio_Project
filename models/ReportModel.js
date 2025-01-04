
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'ACCEPTED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
    reviewedBy: {
      type: DataTypes.TEXT,
      //allowNull: false,
    },
  }, {
    tableName: 'reports',
  });

  module.exports = Report;

