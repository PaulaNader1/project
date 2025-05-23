// chatModel.js

const pool = require('./db'); // Database connection

// Create a new chat session
const createChat = async (userId) => {
    const result = await pool.query(
        'INSERT INTO chats (user_id) VALUES ($1) RETURNING *',
        [userId]
    );
    return result.rows[0];
};

// Get all chats for a specific user
const getChatsByUserId = async (userId) => {
    const result = await pool.query(`
        SELECT chats.*, 
            (SELECT message FROM messages 
             WHERE messages.chat_id = chats.id 
             ORDER BY created_at DESC 
             LIMIT 1) AS lastMessage
        FROM chats
        WHERE chats.user_id = $1
        ORDER BY created_at DESC
    `, [userId]);
    return result.rows;
};

// Get chat details by chat ID
const getChatById = async (chatId) => {
    const result = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);
    return result.rows[0];
};

// Get all chats for admin
const getChatsForAdmin = async () => {
    const result = await pool.query(`
        SELECT chats.*, users.email AS userEmail,
            (SELECT message FROM messages 
             WHERE messages.chat_id = chats.id 
             ORDER BY created_at DESC 
             LIMIT 1) AS lastMessage
        FROM chats
        LEFT JOIN users ON chats.user_id = users.id
        ORDER BY chats.status DESC, chats.created_at DESC
    `);
    return result.rows;
};

// Add a new message to a chat
const addMessage = async (chatId, senderId, message, isMarkdown) => {
    const result = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, message, is_markdown, is_read) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [chatId, senderId, message, isMarkdown, false] // Set is_read to false initially
    );
    return result.rows[0];
};

// Get messages for a specific chat
const getMessagesByChatId = async (chatId) => {
    try {
        const result = await pool.query(
            `SELECT m.id, m.chat_id, m.sender_id, m.message, m.is_markdown, m.created_at, m.is_read
             FROM messages m
             WHERE m.chat_id = $1
             ORDER BY m.created_at ASC`,
            [chatId]
        );
        return result.rows;
    } catch (err) {
        console.error("Error in getMessagesByChatId:", err);
        throw err;
    }
};

// Update chat status and admin_id when an admin responds
const updateChatStatus = async (chatId, status, admin_id) => {
    await pool.query(
        'UPDATE chats SET status = $1 , admin_id = $2 WHERE id = $3',
        [status, admin_id, chatId]
    );
};

const isAdmin = async (userId) => {
    const result = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
    );
    return result.rows[0]?.role === 'admin';
};

const getLastMessage = async (chatId) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1',
        [chatId]
    );
    return result.rows[0];
};

// Mark multiple messages as read
const markMessagesAsRead = async (chatId, userId) => {
    const result = await pool.query(
        'UPDATE messages SET is_read = TRUE WHERE chat_id = $1 AND sender_id != $2 AND is_read = FALSE RETURNING id',
        [chatId, userId]
    );
    return result.rows.map(row => row.id);
};

// Mark a single message as read
const markMessageAsRead = async (messageId) => {
    await pool.query(
        'UPDATE messages SET is_read = TRUE WHERE id = $1',
        [messageId]
    );
};

module.exports = {
    getChatById,
    markMessageAsRead,
    markMessagesAsRead,
    isAdmin,
    createChat,
    getChatsByUserId,
    getChatsForAdmin,
    addMessage,
    getMessagesByChatId,
    updateChatStatus,
    getLastMessage
};
