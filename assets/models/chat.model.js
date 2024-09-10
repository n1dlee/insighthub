const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.Conversation, { foreignKey: 'conversationId' });
      Chat.belongsTo(models.Student, { as: 'sender', foreignKey: 'senderId' });
    }
  }

  Chat.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Chat',
    tableName: 'chats',
    timestamps: true,
    updatedAt: false // We only need createdAt for messages
  });

  return Chat;
};