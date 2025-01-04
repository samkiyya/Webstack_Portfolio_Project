
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:'pending'
      },
    reviewRating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    
    },
  }, {
    tableName: 'reviews',
  });

  module.exports = Review;
