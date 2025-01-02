const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const BookAudio = sequelize.define('BookAudio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
 
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    episode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'book_audios',
  });

  module.exports = BookAudio