// controllers/chatController.js
const chatModel = require('../models/chatModel');

let io;

const setSocketIo = (socketIo) => {
    io = socketIo;
};

// Create a new chat (initiated by user)
const createChat = async (req, res) => {
    const { userId } = req.body;
    try {
        const chat = await chatModel.createChat(userId);
        res.status(201).json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create chat' });
    }
};

// Retrieve all chats for a user
const getUserChats = async (req, res) => {
    const { userId } = req.params;
    try {
        const chats = await chatModel.getChatsByUserId(userId);
        const chatsWithLastMessage = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await chatModel.getLastMessage(chat.id);
                return { ...chat, lastMessage: lastMessage ? lastMessage.message : "No messages yet" };
            })
        );
        res.json(chatsWithLastMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve chats' });
    }
};

// Retrieve all chats for an admin
const getAdminChats = async (req, res) => {
    try {
        const chats = await chatModel.getChatsForAdmin();
        const chatsWithLastMessage = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await chatModel.getLastMessage(chat.id);
                return { ...chat, lastMessage: lastMessage ? lastMessage.message : "No messages yet" };
            })
        );
        res.json(chatsWithLastMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve chats' });
    }
};

// Add a message to a chat
const sendMessage = async (req, res) => {
    const { chatId, senderId, message, isMarkdown } = req.body;

    // Validation to check if required fields are provided
    if (!chatId || !senderId || !message) {
        return res.status(400).json({ error: 'Missing required fields: chatId, senderId, or message' });
    }

    try {
        // Save the message in the database
        const newMessage = await chatModel.addMessage(chatId, senderId, message, isMarkdown);

        // Check if sender is admin
        const isAdmin = await chatModel.isAdmin(senderId);

        // If the message is from an admin, mark the chat as answered
        if (isAdmin) {
            await chatModel.updateChatStatus(chatId, "answered", senderId);
            io.to(chatId.toString()).emit('statusUpdated', { chatId, status: 'answered' });
        }

        // Emit the message to the chat room
        io.to(chatId.toString()).emit('receiveMessage', newMessage);

        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error in sendMessage:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get messages for a specific chat
const getMessages = async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await chatModel.getMessagesByChatId(chatId);
        console.log("Fetched Messages:", messages); // Log the messages for debugging
        res.json(messages);
    } catch (err) {
        console.error("Error in getMessages:", err);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};

const updateChatStatus = async (req, res) => {
    const { chatId } = req.params;
    const { status } = req.body;

    try {
        await chatModel.updateChatStatus(chatId, status); // Call the model function to update status
        res.status(200).json({ message: 'Chat status updated successfully' });
    } catch (err) {
        console.error('Error updating chat status:', err);
        res.status(500).json({ error: 'Failed to update chat status' });
    }
};

const markMessagesAsRead = async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body;

    try {
        await chatModel.markMessagesAsRead(chatId, userId);
        res.status(200).json({ success: true, message: 'Messages marked as read.' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

module.exports = {
    markMessagesAsRead,
    createChat,
    updateChatStatus,
    getUserChats,
    getAdminChats,
    sendMessage,
    getMessages,
    setSocketIo
};
