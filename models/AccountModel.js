const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AccountName = sequelize.define('AccountName', {
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
    number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
  }, {
    tableName: 'account_names',
  });

  module.exports = AccountName