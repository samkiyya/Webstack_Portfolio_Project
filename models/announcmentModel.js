const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Comment = require('./commentModel');
const Like = require('./likeModel');

const Announcement = sequelize.define(
  'Announcement',
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'announcements',
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Associations
Announcement.hasMany(Comment, { foreignKey: 'announcementId', onDelete: 'CASCADE' });
Announcement.hasMany(Like, { foreignKey: 'announcementId', onDelete: 'CASCADE' });

module.exports = Announcement;
