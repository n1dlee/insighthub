const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.Student, {
        as: 'participant1',
        foreignKey: 'participant1Id'
      });
      Conversation.belongsTo(models.Student, {
        as: 'participant2',
        foreignKey: 'participant2Id'
      });
      Conversation.hasMany(models.Chat, { foreignKey: 'conversationId' });
    }
  }

  Conversation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    participant1Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    participant2Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: true
  });

  return Conversation;
};