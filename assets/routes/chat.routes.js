const Router = require("express");
const router = new Router();
const chatController = require("../controller/chat.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Route to fetch all conversations for the logged-in user
router.get("/chat/conversations", chatController.getConversations);

// Route to fetch a specific conversation
router.get("/chat/:conversationId", chatController.getConversation);

// Route to send a message to an existing conversation
router.post("/chat", chatController.sendMessage);

// Route to start a new conversation with a participant
router.post("/chat/start", chatController.startConversation);

module.exports = router;
