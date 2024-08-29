const sequelize = require("../../db");
const { DataTypes } = require("sequelize");
const workHistory = require("./workHistory.model"); // Import workHistory model
const workExperience = require("./workExperience.model"); // Import workExperience model

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
    profile_image: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "investor", // If you need to explicitly specify the table name
  }
);

investor.hasMany(workHistory, { foreignKey: "investorId" });
investor.hasMany(workExperience, { foreignKey: "investorId" });

module.exports = investor;
