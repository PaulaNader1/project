// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const ordersRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatController = require('./controllers/chatController');
const userModel = require('./models/userModel');
const chatModel = require('./models/chatModel');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

chatController.setSocketIo(io);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/chats', chatRoutes);

io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    socket.userId = userId ? userId.toString() : null; // Ensure userId is a string

    console.log('Client connected:', socket.id, 'User ID:', userId);

    if (userId && userId !== 'null' && !isNaN(userId)) {
        try {
            await userModel.updateUserStatus(userId, 'online');
            console.log(`User ID ${userId} status set to online.`);
            io.emit('userStatusUpdated', { userId, status: 'online' });
        } catch (error) {
            console.error('Error updating user status to online:', error);
        }
    } else {
        console.warn(`Invalid userId received for socket ${socket.id}:`, userId);
    }

    socket.on('updateOrderStatus', ({ orderId, status }) => {
        console.log(`Order status updated. Order ID: ${orderId}, Status: ${status}`);
        io.emit('orderStatusUpdated', { orderId, status });
    });

    // Handle joining chat rooms
    socket.on('joinChat', async (chatId) => {
        socket.join(chatId.toString());
        console.log(`Client ${socket.id} (User ID: ${userId}) joined chat room: ${chatId}`);
    
        // Mark previous unread messages as read for this user
        try {
            const messageIds = await chatModel.markMessagesAsRead(chatId, userId);
    
            // Emit the event to update the frontend
            io.to(chatId.toString()).emit('messagesMarkedAsRead', { chatId, messageIds });
    
            // NEW CODE: Emit to the recipient's socket(s) if they are not in the room
            const recipientId = await getOtherUserId(chatId, userId);
            if (recipientId) {
                const recipientSockets = findSocketsByUserId(recipientId.toString());
                console.log(`Recipient ID: ${recipientId}, Sockets found: ${recipientSockets.length}`);
                recipientSockets.forEach((s) => {
                    console.log(`Emitting 'messagesMarkedAsRead' to socket ID: ${s.id}`);
                    s.emit('messagesMarkedAsRead', { chatId, messageIds });
                });
            } else {
                console.log('Recipient ID is null, cannot emit messagesMarkedAsRead.');
            }
    
            console.log(`Messages marked as read in chat room: ${chatId}`);
        } catch (error) {
            console.error(`Error marking messages as read for chat ${chatId}:`, error);
        }
    });

    // Handle leaving chat rooms
    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId.toString());
        console.log(`Client ${socket.id} (User ID: ${userId}) left chat room: ${chatId}`);
    });

    socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}, User ID: ${userId}`);
        if (userId && userId !== 'null' && !isNaN(userId)) {
            try {
                await userModel.updateUserStatus(userId, 'offline');
                console.log(`User ID ${userId} status set to offline.`);
                io.emit('userStatusUpdated', { userId, status: 'offline' });
            } catch (error) {
                console.error('Error updating user status to offline on disconnect:', error);
            }
        } else {
            console.warn(`Skipping status update for invalid userId on disconnect: ${userId}`);
        }
    });
});

async function getOtherUserId(chatId, currentUserId) {
    const chat = await chatModel.getChatById(chatId);
    const chatUserId = chat.user_id.toString();
    const chatAdminId = chat.admin_id ? chat.admin_id.toString() : null;

    let otherUserId = null;
    if (chatUserId === currentUserId) {
        otherUserId = chatAdminId;
    } else {
        otherUserId = chatUserId;
    }
    console.log(`getOtherUserId - Chat ID: ${chatId}, Current User ID: ${currentUserId}, Other User ID: ${otherUserId}`);
    return otherUserId;
}

// Function to find all sockets connected for a given userId
function findSocketsByUserId(userId) {
    const sockets = Array.from(io.sockets.sockets.values()).filter((socket) => {
        return socket.userId === userId;
    });
    console.log(`findSocketsByUserId - User ID: ${userId}, Sockets Found: ${sockets.length}`);
    return sockets;
}

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});





// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const ordersRoutes = require('./routes/orderRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:3001",
//         methods: ["GET", "POST"]
//     }
// });

// // Temporary in-memory storage for user statuses
// const onlineUsers = {};

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', ordersRoutes);
// app.use('/api/chats', chatRoutes);

// // Socket.io for Order Status, Chat Messages, and User Online/Offline Status
// io.on('connection', (socket) => {
//     console.log('Client connected:', socket.id);

//     // Handle User Online/Offline Status
//     socket.on('userOnline', (userId) => {
//         onlineUsers[userId] = true;
//         io.emit('userStatusUpdated', { userId, status: 'online' });
//     });

//     socket.on('disconnect', () => {
//         const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
//         if (userId) {
//             delete onlineUsers[userId];
//             io.emit('userStatusUpdated', { userId, status: 'offline' });
//         }
//         console.log('Client disconnected:', socket.id);
//     });

//     // Handle Order Status Update
//     socket.on('updateOrderStatus', ({ orderId, status }) => {
//         io.emit('orderStatusUpdated', { orderId, status });
//     });

//     // Handle Chat Message Events
//     socket.on('newMessage', ({ chatId, message, senderId, isMarkdown }) => {
//         io.emit('receiveMessage', { chatId, message, senderId, isMarkdown });
//     });

//     // Mark the chat as answered once an admin replies
//     socket.on('markChatAsAnswered', (chatId) => {
//         io.emit('chatAnswered', chatId);
//     });
// });

// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something went wrong!');
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
