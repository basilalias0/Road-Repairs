const express = require('express');
const chatRouter = express.Router();
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/authMiddleware');

chatRouter.post('/', protect, chatController.createChatMessage);
chatRouter.get('/:breakdownId/:userId1/:userId2', protect, chatController.getChatMessages);
chatRouter.get('/user/:userId', protect, chatController.getUserChats);
chatRouter.delete('/:id', protect, authorize(['customer', 'workshop', 'admin']), chatController.deleteChatMessage);

module.exports = chatRouter;