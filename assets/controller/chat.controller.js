const { Op } = require('sequelize');
const ApiError = require("../error/ApiError");
const Chat = require("../models/chat.model");
const Conversation = require("../models/conversation.model");
const User = require("../models/student.model");

class ChatController {
  async createConversation(req, res, next) {
    try {
      const { participantId } = req.body; // ID of the other participant
      const userId = req.user.id; // The logged-in user's ID
  
      if (!participantId) {
        return next(ApiError.badRequest("Participant ID is required"));
      }
  
      // Check if a conversation between these two users already exists
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { participant1Id: userId, participant2Id: participantId },
            { participant1Id: participantId, participant2Id: userId },
          ],
        },
      });
  
      if (conversation) {
        return res.json(conversation); // Return existing conversation
      }
  
      // Create a new conversation if none exists
      conversation = await Conversation.create({
        participant1Id: userId,
        participant2Id: participantId,
      });
  
      res.status(201).json(conversation); // Respond with the new conversation
    } catch (error) {
      console.error("Error creating conversation:", error);
      next(ApiError.internal("Error creating conversation"));
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { conversationId, content } = req.body;
      const userId = req.user.id;

      // Check for missing parameters
      if (!conversationId || !content) {
        return next(ApiError.badRequest("Conversation ID and message content are required"));
      }

      // Ensure the conversation exists
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return next(ApiError.notFound("Conversation not found"));
      }

      // Create and save the new message
      const newMessage = await Chat.create({
        conversationId,
        senderId: userId,
        content,
      });

      res.status(201).json(newMessage);  // 201 Created response
    } catch (error) {
      console.error("Error sending message:", error);
      next(ApiError.internal("Error sending message"));
    }
  }

  // Get a specific conversation and its messages
  async getConversation(req, res, next) {
    try {
      const conversationId = req.params.conversationId;
      const userId = req.user.id;

      // Ensure the conversation ID is provided
      if (!conversationId) {
        return next(ApiError.badRequest("Conversation ID is required"));
      }

      // Fetch the conversation with participants and messages
      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          { model: Chat, include: [{ model: User, as: "sender", attributes: ['id', 'name', 'surname'] }] },  // Include messages and sender info
          { model: User, as: "participant1", attributes: ['id', 'name', 'surname'] }, // Participant 1 info
          { model: User, as: "participant2", attributes: ['id', 'name', 'surname'] }, // Participant 2 info
        ],
        order: [[Chat, 'createdAt', 'ASC']],  // Order messages by creation time (oldest first)
      });

      // Check if the conversation exists
      if (!conversation) {
        return next(ApiError.notFound("Conversation not found"));
      }

      // Ensure the user is a participant in the conversation
      if (conversation.participant1.id !== userId && conversation.participant2.id !== userId) {
        return next(ApiError.forbidden("You are not a participant in this conversation"));
      }

      res.json(conversation);  // Return the conversation with messages
    } catch (error) {
      console.error("Error fetching conversation:", error);
      next(ApiError.internal("Error fetching conversation"));
    }
  }

  // Get all conversations for the authenticated user
  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;

      // Fetch all conversations where the user is either participant 1 or participant 2
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        },
        include: [
          { model: User, as: "participant1", attributes: ['id', 'name', 'surname', 'profile_image'] },  // Participant 1 info
          { model: User, as: "participant2", attributes: ['id', 'name', 'surname', 'profile_image'] },  // Participant 2 info
          {
            model: Chat,  // Include the latest message in each conversation
            limit: 1,  // Only fetch the most recent message
            order: [['createdAt', 'DESC']],
            attributes: ['content', 'createdAt']
          }
        ],
        order: [[Chat, 'createdAt', 'DESC']]  // Order conversations by the latest message
      });

      res.json(conversations);  // Return all conversations
    } catch (error) {
      console.error("Error fetching conversations:", error);
      next(ApiError.internal("Error fetching conversations"));
    }
  }
  async startConversation(req, res, next) {
    try {
      const { participantId } = req.body;
      const userId = req.user.id;

      // Ensure both participantId and userId are present
      if (!participantId) {
        return next(ApiError.badRequest("Participant ID is required"));
      }

      // Check if the conversation between these two users already exists
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { participant1Id: userId, participant2Id: participantId },
            { participant1Id: participantId, participant2Id: userId }
          ]
        }
      });

      // If no conversation exists, create a new one
      if (!conversation) {
        conversation = await Conversation.create({
          participant1Id: userId,
          participant2Id: participantId,
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
