const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },

  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 
  registerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    //allowNull: false,
  },
  userInvited: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    //allowNull: false,
  },
  referalCode: {
    type: DataTypes.STRING,
    unique: true,

    
    //allowNull: false,
  },

  role: {
    type: DataTypes.ENUM('ADMIN', 'MODERATOR','SALES','STAFF','COMPOSER'),
    defaultValue: 'MODERATOR',
  },
}, {
  tableName: 'admins',

});

module.exports = Admin;