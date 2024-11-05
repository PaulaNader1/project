
'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from './ChatPage.module.css'; // Import the CSS module

let socket;

export default function ChatPage({ userRole }) {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [otherUserEmail, setOtherUserEmail] = useState('');
    const [otherUserStatus, setOtherUserStatus] = useState('offline');
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    useEffect(() => {
        if (userId) {
            socket = io('http://localhost:3000', {
                query: { userId }
            });
        }

        const fetchChats = async () => {
            try {
                const response = userRole === 'admin'
                    ? await axios.get('http://localhost:3000/api/chats/admin')
                    : await axios.get(`http://localhost:3000/api/chats/user/${userId}`);
                setChats(response.data);
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };

        fetchChats();

        if (socket) {
            socket.on('receiveMessage', (message) => {
                if (message.chat_id === selectedChat?.id) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            });

            socket.on('newChat', (chat) => {
                if (userRole === 'admin') {
                    setChats(prevChats => [chat, ...prevChats]);
                }
            });

            socket.on('statusUpdated', ({ chatId, status }) => {
                setChats((prevChats) =>
                    prevChats.map(chat =>
                        chat.id === chatId ? { ...chat, status } : chat
                    )
                );
            });

            socket.on('userStatusUpdated', ({ status }) => {
                setOtherUserStatus(status);
            });

            socket.on('messagesMarkedAsRead', ({ chatId }) => {
                if (selectedChat?.id === chatId) {
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) => ({ ...msg, is_read: true }))
                    );
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('receiveMessage');
                socket.off('newChat');
                socket.off('statusUpdated');
                socket.off('userStatusUpdated');
                socket.off('messagesMarkedAsRead');
            }
        };
    }, [userRole, userId, selectedChat?.id]);

    const startNewChat = async () => {
        if (userRole === 'user') {
            try {
                const response = await axios.post('http://localhost:3000/api/chats/create', { userId });
                const newChat = response.data;
                setChats(prevChats => [newChat, ...prevChats]);
                setSelectedChat(newChat);
                setMessages([]);
            } catch (error) {
                console.error('Error starting new chat:', error);
            }
        }
    };

    const selectChat = async (chat) => {
        if (!chat) return;
        setSelectedChat(chat);
        setOtherUserStatus('offline');

        try {
            const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);

            // Check if there are messages before setting them
            if (response.data && response.data.length > 0) {
                console.log(response.data[0].sender_id);
                setMessages(response.data);
            } else {
                // If there are no messages, set an empty array
                setMessages([]);
            }

            // Call the API to mark messages as read
            await axios.put(`http://localhost:3000/api/chats/${chat.id}/mark-read`, { userId });

            // Emit a socket event to notify the other user that messages are read
            socket.emit('markMessagesRead', { chatId: chat.id, userId });

            socket.emit('joinChat', chat.id.toString());
            console.log(userId);

            if (userRole === 'admin') {
                const userResponse = await axios.get(`http://localhost:3000/api/users/${chat.user_id}`);
                setOtherUserEmail(userResponse.data.email);
            } else {
                if (chat.admin_id) {
                    const adminResponse = await axios.get(`http://localhost:3000/api/users/${chat.admin_id}`);
                    setOtherUserEmail(adminResponse.data.email);
                } else {
                    setOtherUserEmail('No admin assigned yet');
                }
            }
        } catch (error) {
            console.error('Error fetching messages or user email:', error);
        }
    };


    // const selectChat = async (chat) => {
    //     if (!chat) return;
    //     setSelectedChat(chat);
    //     setOtherUserStatus('offline');

    //     try {
    //         const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);

    //         // Check if there are messages before setting them and set the is_read status
    //         if (response.data && response.data.length > 0) {
    //             setMessages(response.data.map(msg => ({
    //                 ...msg,
    //                 isRead: msg.is_read // Assuming each message has an `is_read` field from the API
    //             })));
    //         } else {
    //             setMessages([]);
    //         }

    //         // Call the API to mark all messages as read if the user opens the chat
    //         await axios.put(`http://localhost:3000/api/chats/${chat.id}/mark-read`, { userId });

    //         // Emit a socket event to notify the other user that messages are read
    //         socket.emit('markMessagesRead', { chatId: chat.id, userId });

    //         socket.emit('joinChat', chat.id.toString());
    //         console.log(userId);

    //         if (userRole === 'admin') {
    //             const userResponse = await axios.get(`http://localhost:3000/api/users/${chat.user_id}`);
    //             setOtherUserEmail(userResponse.data.email);
    //         } else {
    //             if (chat.admin_id) {
    //                 const adminResponse = await axios.get(`http://localhost:3000/api/users/${chat.admin_id}`);
    //                 setOtherUserEmail(adminResponse.data.email);
    //             } else {
    //                 setOtherUserEmail('No admin assigned yet');
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error fetching messages or user email:', error);
    //     }
    // };

    const sendMessage = async () => {
        if (input.trim() && selectedChat) {
            const messageData = {
                chatId: selectedChat.id,
                senderId: userId,
                message: input,
                isMarkdown: false,
            };
            try {
                const response = await axios.post('http://localhost:3000/api/chats/message', messageData);
                socket.emit('sendMessage', response.data);
                setInput('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const markAsAnswered = async (chatId) => {
        try {
            await axios.put(`http://localhost:3000/api/chats/${chatId}/status`, { status: 'answered' });
            socket.emit('statusUpdated', { chatId, status: 'answered' });
        } catch (error) {
            console.error('Error marking as answered:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.chatContainer}>
                <div className={styles.chatList}>
                    <div className={styles.chatListHeader}>
                        <h3>Chats</h3>
                        {userRole === 'user' && (
                            <button onClick={startNewChat} className={styles.newChatButton}>
                                Start New Chat
                            </button>
                        )}
                    </div>
                    {chats.map(chat => (
                        <div key={chat.id} className={styles.chatItem} onClick={() => selectChat(chat)}>
                            <p><strong>{userRole === 'admin' ? chat.userEmail : 'Admin'}</strong> - {new Date(chat.created_at).toLocaleString()}</p>
                            <p>{chat.lastMessage || "No messages yet"}</p>
                            {userRole === 'admin' && (
                                <div>
                                    <p className={chat.status === 'unanswered' ? styles.unanswered : styles.answered}>
                                        {chat.status === 'unanswered' ? "Unanswered" : "Answered"}
                                    </p>
                                    {chat.status === 'unanswered' && (
                                        <button onClick={() => markAsAnswered(chat.id)} className={styles.answerButton}>
                                            Mark as Answered
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.chatMessagesContainer}>
                    {otherUserEmail && (
                        <div className={styles.chatHeader}>
                            {otherUserEmail} -
                            <span className={otherUserStatus === 'online' ? styles.online : styles.offline}>
                                {otherUserStatus}
                            </span>
                        </div>
                    )}
                    <div className={styles.messageArea}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${parseInt(msg.sender_id) === parseInt(userId) ? styles.sentWrapper : styles.receivedWrapper}`}
                            >
                                <div className={`${styles.messageBubble}`}>
                                    {msg.message}
                                    {parseInt(msg.sender_id) === parseInt(userId) && msg.is_read && (
                                        <span className={styles.readReceipt}>✓✓</span>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>

                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write message here"
                            className={styles.messageInput}
                        />
                        <button onClick={sendMessage} className={styles.sendButton}>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}



//<div className={`${styles.messageBubble} ${msg.isRead ? styles.read : ''}`}>
//    {msg.message}
//    {msg.isRead && (
//        <span className={styles.blueTicks}>
//            ✔✔ {/* Or use an icon for blue ticks if available */}
//        </span>
//    )}
//</div>