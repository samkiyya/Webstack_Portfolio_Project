const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import related models
const User = require('./Usermodel'); // Assuming the User model is defined in User.js
const Review = require('./ReviewModel'); // Assuming the Review model is defined in Review.js

const ReviewFeedback = sequelize.define(
  'ReviewFeedback',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.INTEGER, // Updated to match User ID type
      allowNull: false,
    },
    review_id: {
      type: DataTypes.INTEGER, // Updated to match Review ID type
      allowNull: false,
    },
  },
  {
    tableName: 'reviewsFeedback',
  }
);

// Associations
ReviewFeedback.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author', // Alias for the User relationship
  onDelete: 'CASCADE', // Optional: delete feedback when the user is deleted
});

ReviewFeedback.belongsTo(Review, {
  foreignKey: 'review_id',
  as: 'review', // Alias for the Review relationship
  onDelete: 'CASCADE', // Optional: delete feedback when the review is deleted
});

// If needed, you can add reverse relationships
User.hasMany(ReviewFeedback, {
  foreignKey: 'author_id',
  as: 'feedbacks', // Alias for the feedback relationship
});

Review.hasMany(ReviewFeedback, {
  foreignKey: 'review_id',
  as: 'feedbacks', // Alias for the feedback relationship
});

module.exports = ReviewFeedback;
