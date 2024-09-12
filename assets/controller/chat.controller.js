const { Op } = require("sequelize");
const ApiError = require("../error/ApiError");
const Chat = require("../models/chat.model");
const Conversation = require("../models/conversation.model");
const Student = require("../models/student.model");

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

      // Update the lastMessageAt field of the conversation
      await conversation.update({ lastMessageAt: new Date() });

      res.status(201).json(newMessage);
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
          {
            model: Chat,
            include: [
              {
                model: Student,
                as: "sender",
                attributes: ["id", "name", "surname", "profile_image"],
              },
            ],
            order: [["createdAt", "ASC"]],
          },
          {
            model: Student,
            as: "participant1",
            attributes: ["id", "name", "surname", "profile_image"],
          },
          {
            model: Student,
            as: "participant2",
            attributes: ["id", "name", "surname", "profile_image"],
          },
        ],
      });

      if (!conversation) {
        return next(ApiError.notFound("Conversation not found"));
      }

      if (
        conversation.participant1Id !== userId &&
        conversation.participant2Id !== userId
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
          {
            model: Student,
            as: "participant1",
            attributes: ["id", "name", "surname", "profile_image"],
          },
          {
            model: Student,
            as: "participant2",
            attributes: ["id", "name", "surname", "profile_image"],
          },
          {
            model: Chat,
            limit: 1,
            order: [["createdAt", "DESC"]],
            attributes: ["content", "createdAt", "senderId"],
          },
        ],
        order: [["lastMessageAt", "DESC"]],
      });

      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      next(ApiError.internal("Error fetching conversations"));
    }
  }

  async startConversation(req, res, next) {
    try {
      const { participantId } = req.body;
      const userId = req.user.id;

      if (!participantId) {
        return next(ApiError.badRequest("Participant ID is required"));
      }

      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { participant1Id: userId, participant2Id: participantId },
            { participant1Id: participantId, participant2Id: userId },
          ],
        },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participant1Id: userId,
          participant2Id: participantId,
          lastMessageAt: new Date(),
        });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error starting conversation:", error);
      next(ApiError.internal("Error starting conversation"));
    }
  }
}

module.exports = new ChatController();
