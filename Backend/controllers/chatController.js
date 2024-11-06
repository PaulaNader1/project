// // chatController.js

// const chatModel = require('../models/chatModel');

// let io;

// const setSocketIo = (socketIo) => {
//     io = socketIo;
// };

// // Create a new chat (initiated by user)
// const createChat = async (req, res) => {
//     const { userId } = req.body;
//     try {
//         const chat = await chatModel.createChat(userId);
//         res.status(201).json(chat);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to create chat' });
//     }
// };

// // Retrieve all chats for a user
// const getUserChats = async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const chats = await chatModel.getChatsByUserId(userId);
//         const chatsWithLastMessage = await Promise.all(
//             chats.map(async (chat) => {
//                 const lastMessage = await chatModel.getLastMessage(chat.id);
//                 return { ...chat, lastMessage: lastMessage ? lastMessage.message : "No messages yet" };
//             })
//         );
//         res.json(chatsWithLastMessage);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to retrieve chats' });
//     }
// };

// // Retrieve all chats for an admin
// const getAdminChats = async (req, res) => {
//     try {
//         const chats = await chatModel.getChatsForAdmin();
//         const chatsWithLastMessage = await Promise.all(
//             chats.map(async (chat) => {
//                 const lastMessage = await chatModel.getLastMessage(chat.id);
//                 return { ...chat, lastMessage: lastMessage ? lastMessage.message : "No messages yet" };
//             })
//         );
//         res.json(chatsWithLastMessage);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to retrieve chats' });
//     }
// };

// // Add a message to a chat
// const sendMessage = async (req, res) => {
//     const { chatId, senderId, message, isMarkdown } = req.body;

//     if (!chatId || !senderId || !message) {
//         return res.status(400).json({ error: 'Missing required fields: chatId, senderId, or message' });
//     }

//     try {
//         const newMessage = await chatModel.addMessage(chatId, senderId, message, isMarkdown);

//         // Check if sender is admin
//         const isAdmin = await chatModel.isAdmin(senderId);

//         // If the message is from an admin, mark the chat as answered
//         if (isAdmin) {
//             await chatModel.updateChatStatus(chatId, "answered", senderId);
//             io.to(chatId.toString()).emit('statusUpdated', { chatId, status: 'answered' });
//         }

//         // Emit the message to the chat room
//         io.to(chatId.toString()).emit('receiveMessage', newMessage);

//         // Check if both users are in the chat room
//         const room = io.sockets.adapter.rooms.get(chatId.toString());
//         if (room && room.size > 1) {
//             const socketsInRoom = Array.from(room);
//             const userIdsInRoom = socketsInRoom.map(socketId => {
//                 const socketInRoom = io.sockets.sockets.get(socketId);
//                 return socketInRoom.userId;
//             });

//             const chat = await chatModel.getChatById(chatId);
//             const user1 = chat.user_id.toString();
//             const user2 = chat.admin_id ? chat.admin_id.toString() : null;

//             if (user2 && userIdsInRoom.includes(user1) && userIdsInRoom.includes(user2)) {
//                 // Mark the message as read
//                 await chatModel.markMessageAsRead(newMessage.id);
//                 newMessage.is_read = true;

//                 // Emit the messagesMarkedAsRead event
//                 io.to(chatId.toString()).emit('messagesMarkedAsRead', { chatId, messageIds: [newMessage.id] });
//             }
//         }

//         res.status(201).json(newMessage);
//     } catch (err) {
//         console.error('Error in sendMessage:', err);
//         res.status(500).json({ error: 'Failed to send message' });
//     }
// };

// // Get messages for a specific chat
// const getMessages = async (req, res) => {
//     const { chatId } = req.params;
//     try {
//         const messages = await chatModel.getMessagesByChatId(chatId);
//         res.json(messages);
//     } catch (err) {
//         console.error("Error in getMessages:", err);
//         res.status(500).json({ error: 'Failed to retrieve messages' });
//     }
// };

// const updateChatStatus = async (req, res) => {
//     const { chatId } = req.params;
//     const { status } = req.body;

//     try {
//         await chatModel.updateChatStatus(chatId, status);
//         res.status(200).json({ message: 'Chat status updated successfully' });
//     } catch (err) {
//         console.error('Error updating chat status:', err);
//         res.status(500).json({ error: 'Failed to update chat status' });
//     }
// };

// const markMessagesAsRead = async (req, res) => {
//     const { chatId } = req.params;
//     const { userId } = req.body;

//     try {
//         await chatModel.markMessagesAsRead(chatId, userId);
//         res.status(200).json({ success: true, message: 'Messages marked as read.' });
//     } catch (error) {
//         console.error('Error marking messages as read:', error);
//         res.status(500).json({ error: 'Failed to mark messages as read' });
//     }
// };

// module.exports = {
//     markMessagesAsRead,
//     createChat,
//     updateChatStatus,
//     getUserChats,
//     getAdminChats,
//     sendMessage,
//     getMessages,
//     setSocketIo
// };


// chatController.js

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

    if (!chatId || !senderId || !message) {
        return res.status(400).json({ error: 'Missing required fields: chatId, senderId, or message' });
    }

    try {
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

        // Identify the recipient
        const chat = await chatModel.getChatById(chatId);
        const senderIdInt = parseInt(senderId);
        const chatUserId = parseInt(chat.user_id);
        const chatAdminId = chat.admin_id ? parseInt(chat.admin_id) : null;

        const recipientId = (senderIdInt === chatUserId) ? chatAdminId : chatUserId;

        // NEW CODE: Assign admin to chat if not already assigned and emit 'adminAssigned' event
        if (!chat.admin_id && isAdmin) {
            // Assign admin to the chat
            await chatModel.assignAdminToChat(chatId, senderId);

            // Emit event to the user to update admin info
            const userId = chat.user_id;
            const userSockets = findSocketsByUserId(userId);
            userSockets.forEach((socket) => {
                socket.emit('adminAssigned', { chatId, adminId: senderId });
            });
        }

        if (recipientId !== null) {
            // Proceed only if recipientId is not null
            // Check if the recipient is in the chat room
            const room = io.sockets.adapter.rooms.get(chatId.toString());
            if (room) {
                const socketsInRoom = Array.from(room);
                const recipientIsInRoom = socketsInRoom.some(socketId => {
                    const socketInRoom = io.sockets.sockets.get(socketId);
                    return socketInRoom.userId === recipientId.toString();
                });

                if (recipientIsInRoom) {
                    // Mark the message as read
                    await chatModel.markMessageAsRead(newMessage.id);
                    newMessage.is_read = true;

                    // Emit the messagesMarkedAsRead event to the chat room
                    io.to(chatId.toString()).emit('messagesMarkedAsRead', { chatId, messageIds: [newMessage.id] });
                }
            }
        }
        // If recipientId is null, we don't need to do anything else

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
        await chatModel.updateChatStatus(chatId, status);
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

function findSocketByUserId(userId) {
    return Array.from(io.sockets.sockets.values()).find((socket) => {
        return socket.userId === userId.toString();
    });
}

module.exports = {
    findSocketByUserId,
    markMessagesAsRead,
    createChat,
    updateChatStatus,
    getUserChats,
    getAdminChats,
    sendMessage,
    getMessages,
    setSocketIo
};

