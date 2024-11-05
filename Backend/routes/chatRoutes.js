// routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();

router.post('/create', chatController.createChat); // Create a new chat
router.get('/user/:userId', chatController.getUserChats); // Get all chats for a user
router.get('/admin', chatController.getAdminChats); // Get all chats for an admin
router.post('/message', chatController.sendMessage); // Send a message in a chat
router.get('/:chatId/messages', chatController.getMessages); // Get messages for a chat
router.put('/:chatId/status', chatController.updateChatStatus); // Update chat status

module.exports = router;
