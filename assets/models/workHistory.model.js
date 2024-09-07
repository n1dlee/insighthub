const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

const WorkHistory = sequelize.define("workHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  investorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "investor",
      key: "id",
    },
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = WorkHistory;
