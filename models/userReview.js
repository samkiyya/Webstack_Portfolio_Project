
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./Usermodel'); // Assuming User model is defined
const Book = require('./BookModel');

const UserReview = sequelize.define('UserReview', {
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
    tableName: 'userReviews',
  });
  UserReview.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  UserReview.belongsTo(Book, { foreignKey: 'bookId', onDelete: 'CASCADE' });
  module.exports = UserReview;
