const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Path to your sequelize instance

const Quality = sequelize.define('Quality', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guidelines: {
    type: DataTypes.JSON,  // Storing the guidelines as a JSON array of strings
    allowNull: false,
  }
}, {
  tableName: 'Quality',  // The name of the table in MySQL
  timestamps: true,  // Automatically manage createdAt and updatedAt timestamps
});

module.exports = Quality;
