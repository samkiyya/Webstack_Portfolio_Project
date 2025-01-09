
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Promotion = sequelize.define('Promotion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
     title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
   description: {
    type: DataTypes.STRING,
    allowNull: false,
 },
 url: {
  type: DataTypes.STRING,
  
},
 imagePath: {
    type: DataTypes.STRING,
    allowNull: false,
},
  }, {
    tableName: 'promotions',
  });

  module.exports = Promotion ;

