const sequelize = require("../../db");
const { DataTypes } = require("sequelize");

const WorkExperience = sequelize.define("workExperience", {
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
  skillName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  proficiencyLevel: {
    type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced", "Expert"),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = WorkExperience;
