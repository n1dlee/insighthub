const sequelize = require('../../db'); // Assuming your db.js is located at '../../db'
const { DataTypes } = require('sequelize');

const Major = sequelize.define("major", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'majors' // If you need to explicitly specify the table name
});

module.exports = Major;
