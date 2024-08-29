const sequelize = require("../../db"); // Assuming your db.js is located at '../../db'
const { DataTypes } = require("sequelize");

const investor = sequelize.define(
  "investor",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    middle: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // Assuming password is required
    livesOutsideUS: { type: DataTypes.BOOLEAN, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    jobFunc: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true }, // Assuming bio can be longer text
    workHistory: { type: DataTypes.STRING, allowNull: true },
    workExperience: { type: DataTypes.TEXT, allowNull: true }, // Assuming achievements can be longer text
    profile_image: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "investor", // If you need to explicitly specify the table name
  }
);

module.exports = investor;
