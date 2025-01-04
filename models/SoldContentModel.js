const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SoldContent = sequelize.define('SoldContent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    revenue: {
      type: DataTypes.DECIMAL,
      
      allowNull: false,
    },
    receiptImage: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  serviceCharged: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
},

    
    approvedBy: {
      type: DataTypes.TEXT,
      //allowNull: false,
    },
  }, {
    tableName: 'sold_contents',
  });

  module.exports = SoldContent;