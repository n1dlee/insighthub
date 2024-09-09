const sequelize = require("../../db");
const { DataTypes } = require("sequelize");
const User = require("./student.model");
const Chat = require("../models/chat.model");

const Conversation = sequelize.define("conversation", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  participant1Id: { type: DataTypes.INTEGER, allowNull: false },
  participant2Id: { type: DataTypes.INTEGER, allowNull: false },
  lastMessageAt: { type: DataTypes.DATE, allowNull: true },
});

Conversation.belongsTo(User, {
  as: "participant1",
  foreignKey: "participant1Id",
});
Conversation.belongsTo(User, {
  as: "participant2",
  foreignKey: "participant2Id",
});
Conversation.hasMany(Chat, { foreignKey: "conversationId" });

module.exports = Conversation;
