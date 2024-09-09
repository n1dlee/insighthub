const ApiError = require("../error/ApiError");
const Chat = require("../models/chat.model");
const Conversation = require("../models/conversation.model");
const User = require("../models/student.model");

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { conversationId, content } = req.body;
      const userId = req.user.id;

      if (!conversationId || !content) {
        return next(
          ApiError.badRequest(
            "Conversation ID and message content are required"
          )
        );
      }

      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return next(ApiError.notFound("Conversation not found"));
      }

      const newMessage = await Chat.create({
        conversationId,
        senderId: userId,
        content,
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      next(ApiError.internal("Error sending message"));
    }
  }

  async getConversation(req, res, next) {
    try {
      const conversationId = req.params.conversationId;
      const userId = req.user.id;

      if (!conversationId) {
        return next(ApiError.badRequest("Conversation ID is required"));
      }

      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          { model: Chat, include: [{ model: User, as: "sender" }] },
          { model: User, as: "participant1" },
          { model: User, as: "participant2" },
        ],
      });

      if (!conversation) {
        return next(ApiError.notFound("Conversation not found"));
      }

      // Check if the user is a participant in the conversation
      if (
        conversation.participant1.id !== userId &&
        conversation.participant2.id !== userId
      ) {
        return next(
          ApiError.forbidden("You are not a participant in this conversation")
        );
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      next(ApiError.internal("Error fetching conversation"));
    }
  }

  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;

      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }],
        },
        include: [
          { model: Chat, include: [{ model: User, as: "sender" }] },
          { model: User, as: "participant1" },
          { model: User, as: "participant2" },
        ],
      });

      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      next(ApiError.internal("Error fetching conversations"));
    }
  }
}

module.exports = new ChatController();
