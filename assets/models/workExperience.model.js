const sequelize = require("../../db");
const { DataTypes } = require("sequelize");

const workExperience = sequelize.define(
  "workExperience",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    investorId: {
      type: DataTypes.INTEGER,
      references: { model: "investor", key: "id" },
    },
    achievement: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "workExperience",
  }
);

module.exports = workExperience;
