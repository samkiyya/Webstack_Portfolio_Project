
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    language: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audio_price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },

    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
  },
  rateCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
  },
  serviceCharges: {
    type: DataTypes.FLOAT,
    defaultValue: 1,
},
revenue: {
  type: DataTypes.FLOAT,
  
},
  pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
  },
  sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
  },
  pdfFilePath: {
      type: DataTypes.STRING,
      allowNull: true,
  },
  imageFilePath: {
    type: DataTypes.STRING,
    allowNull: true,
},
status: {
  type: DataTypes.ENUM('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'),
  defaultValue: 'PENDING',
},
reason: {
  type: DataTypes.TEXT,
  //allowNull: false,
},
reviewedBy: {
  type: DataTypes.TEXT,
  //allowNull: false,
},

  }, {
    tableName: 'books',
    charset: 'utf8', 
    collate: 'utf8_general_ci', 
  });


  module.exports = Book