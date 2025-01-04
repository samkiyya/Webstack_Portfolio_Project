// permissionModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User =require('./AdminModel');
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  roleName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  canView: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canCreate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canEdit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Permissions',
});

// Export the model
module.exports = Permission;
