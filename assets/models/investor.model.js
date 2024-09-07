const sequelize = require("../../db");
const { DataTypes } = require("sequelize");
const workHistory = require("./workHistory.model");
const workExperience = require("./workExperience.model");

const investor = sequelize.define(
  "investor",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    middle: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    livesOutsideUS: { type: DataTypes.BOOLEAN, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    jobFunc: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true },
    profile_image: { type: DataTypes.STRING, allowNull: true },
    location: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "investor",
  }
);

investor.hasMany(workHistory, { foreignKey: "investorId" });
investor.hasMany(workExperience, { foreignKey: "investorId" });

module.exports = investor;
