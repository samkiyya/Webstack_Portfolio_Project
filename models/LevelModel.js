const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Level = sequelize.define('Level', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  }, {
    tableName: 'levels',
  });

  module.exports = Level