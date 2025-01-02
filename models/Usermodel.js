const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
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
  phone: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    //allowNull: false,
  },
  point: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    //allowNull: false,
  },
 
  postCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    //allowNull: false,
  },
  orderCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    //allowNull: false,
  },
  orderLimitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    //allowNull: false,
  },
  postLimitCount: {
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
   
    allowNull: true,
  },
  fname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lname: {
    type: DataTypes.STRING,
    //allowNull: false,
  },
  bio: {
    type: DataTypes.STRING,
    //allowNull: false,
  },
  imageFilePath: {
    type: DataTypes.STRING,
   // allowNull: false,
},

  country: {
    type: DataTypes.STRING,
  },

  city: {
    type: DataTypes.STRING,
  },
  deviceInfo: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
isVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},

isTwoStepOn: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

  role: {
    type: DataTypes.ENUM( 'USER','AUTHOR'),
    defaultValue: 'USER',
  },
  
  expirationDate: {
    type: DataTypes.DATE,

},
  
}, {
  tableName: 'users',
  charset: 'utf8',
  collate: 'utf8_general_ci', 

});

module.exports = User;