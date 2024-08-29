const sequelize = require("../../db");
const { DataTypes } = require("sequelize");

const workHistory = sequelize.define(
  "workHistory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    investorId: {
      type: DataTypes.INTEGER,
      references: { model: "investor", key: "id" },
    },
    company: { type: DataTypes.STRING, allowNull: false },
    jobTitle: { type: DataTypes.STRING, allowNull: false },
    fromDate: { type: DataTypes.DATE, allowNull: false },
    toDate: { type: DataTypes.DATE, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "workHistory",
  }
);

module.exports = workHistory;
