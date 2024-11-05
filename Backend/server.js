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

    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`Client ${socket.id} (User ID: ${userId}) joined chat room: ${chatId}`);
    });

    socket.on('sendMessage', (message) => {
        const { chatId } = message;
        console.log(`Message received in chat room ${chatId} from User ID ${userId}:`, message);
        io.to(chatId).emit('receiveMessage', message);
    });

    socket.on('markMessagesRead', ({ chatId, userId }) => {
        // Broadcast to the other user in the chat that messages are read
        socket.to(chatId.toString()).emit('messagesMarkedAsRead', { chatId });
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
