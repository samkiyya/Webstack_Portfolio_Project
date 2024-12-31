
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('book_store', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

module.exports = sequelize;