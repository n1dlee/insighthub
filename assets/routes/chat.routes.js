const Router = require('express');
const router = new Router();
const chatController = require('../controller/chat.controller');

// Route to send a message to an existing conversation
router.post('/', chatController.sendMessage);

// Route to fetch a specific conversation
router.get('/:conversationId', chatController.getConversation);

// Route to fetch all conversations for the logged-in user
router.get('/conversations', chatController.getConversations);

// Route to start a new conversation with a participant
router.post('/start', chatController.startConversation);

module.exports = router;
