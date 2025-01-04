
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const Following = sequelize.define('Following', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  

  }, {
    tableName: 'followings',
  });

  module.exports = Following;
