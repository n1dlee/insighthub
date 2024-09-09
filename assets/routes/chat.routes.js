const express = require("express");
const chatController = require("../controller/chat.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Chat routes
router.post("/chat", authMiddleware, chatController.sendMessage);
router.get(
  "/chat/:conversationId",
  authMiddleware,
  chatController.getConversation
);
router.get("/chat", authMiddleware, chatController.getConversations);

module.exports = router;
