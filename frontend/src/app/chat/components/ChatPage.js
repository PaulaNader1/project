// ChatPage.js

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from './ChatPage.module.css';

export default function ChatPage({ userRole }) {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState({});
    const [input, setInput] = useState('');
    const [otherUserEmail, setOtherUserEmail] = useState('');
    const [otherUserStatus, setOtherUserStatus] = useState('offline');
    const [otherUserId, setOtherUserId] = useState(null);
    const userId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('userId')) : null;

    const socketRef = useRef(null);
    const selectedChatRef = useRef(null);
    const otherUserIdRef = useRef(null);
    const prevChatIdRef = useRef(null);

    // Update refs when state changes
    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        otherUserIdRef.current = otherUserId;
    }, [otherUserId]);

    // Initialize socket connection
    useEffect(() => {
        if (userId && !socketRef.current) {
            socketRef.current = io('http://localhost:3000', {
                query: { userId }
            });

            const socket = socketRef.current;

            // Setup socket event listeners
            socket.on('receiveMessage', (message) => {
                // Update `allMessages` state
                setAllMessages(prevAllMessages => {
                    const chatMessages = prevAllMessages[message.chat_id] || [];
                    return {
                        ...prevAllMessages,
                        [message.chat_id]: [...chatMessages, message],
                    };
                });

                // If the message is for the currently selected chat, update `messages` state
                if (message.chat_id === selectedChatRef.current?.id) {
                    setMessages(prevMessages => [...prevMessages, message]);
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

            socket.on('userStatusUpdated', ({ userId: updatedUserId, status }) => {
                if (updatedUserId && otherUserIdRef.current && parseInt(updatedUserId) === parseInt(otherUserIdRef.current)) {
                    setOtherUserStatus(status);
                }
            });

            socket.on('messagesMarkedAsRead', ({ chatId, messageIds }) => {
                // Update messages in `allMessages`
                setAllMessages(prevAllMessages => {
                    const chatMessages = prevAllMessages[chatId];
                    if (chatMessages) {
                        const updatedMessages = chatMessages.map(msg =>
                            messageIds.includes(parseInt(msg.id)) ? { ...msg, isRead: true } : msg
                        );
                        return { ...prevAllMessages, [chatId]: updatedMessages };
                    }
                    return prevAllMessages;
                });

                // If the chat is currently selected, also update `messages` state
                if (chatId === selectedChatRef.current?.id) {
                    setMessages(prevMessages =>
                        prevMessages.map(msg =>
                            messageIds.includes(parseInt(msg.id)) ? { ...msg, isRead: true } : msg
                        )
                    );
                }
            });

            // Listen for 'adminAssigned' event
            socket.on('adminAssigned', async ({ chatId, adminId }) => {
                if (selectedChatRef.current?.id === chatId && userRole === 'user') {
                    try {
                        // Fetch admin's email and status
                        const adminResponse = await axios.get(`http://localhost:3000/api/users/${adminId}`);
                        setOtherUserEmail(adminResponse.data.email);
                        setOtherUserId(adminId);
                        otherUserIdRef.current = adminId;
                        setOtherUserStatus(adminResponse.data.status);
                    } catch (error) {
                        console.error('Error fetching admin info:', error);
                    }
                }
            });
        }

        return () => {
            if (socketRef.current) {
                const socket = socketRef.current;
                socket.off('receiveMessage');
                socket.off('newChat');
                socket.off('statusUpdated');
                socket.off('userStatusUpdated');
                socket.off('messagesMarkedAsRead');
                socket.off('adminAssigned');
                socket.disconnect(); // Disconnect socket on unmount
                socketRef.current = null;
            }
        };
    }, [userId, userRole]);

    // Handle joining and leaving chat rooms
    useEffect(() => {
        const socket = socketRef.current;

        if (socket) {
            // Leave previous chat room
            if (prevChatIdRef.current && prevChatIdRef.current !== selectedChat?.id?.toString()) {
                socket.emit('leaveChat', prevChatIdRef.current);
            }

            // Join new chat room
            if (selectedChat) {
                socket.emit('joinChat', selectedChat.id.toString());
                prevChatIdRef.current = selectedChat.id.toString();
            }
        }

        return () => {
            if (socket && selectedChat) {
                socket.emit('leaveChat', selectedChat.id.toString());
            }
        };
    }, [selectedChat]);

    useEffect(() => {
        if (selectedChat) {
            const chatMessages = allMessages[selectedChat.id];
            if (chatMessages) {
                setMessages(chatMessages);
            } else {
                // Fetch messages if not already in `allMessages`
                selectChat(selectedChat);
            }
        }
    }, [selectedChat, allMessages]);

    // Fetch chats
    useEffect(() => {
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
    }, [userRole, userId]);

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

        try {
            // Check if messages are already in `allMessages`
            let chatMessages = allMessages[chat.id];
            if (!chatMessages) {
                // Fetch messages from the server
                const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);
                chatMessages = response.data.map(msg => ({
                    ...msg,
                    isRead: msg.is_read
                }));

                // Store messages in `allMessages`
                setAllMessages(prev => ({
                    ...prev,
                    [chat.id]: chatMessages
                }));
            }

            // Update `messages` state for the selected chat
            setMessages(chatMessages);

            // Mark messages as read in the database
            await axios.put(`http://localhost:3000/api/chats/${chat.id}/mark-read`, { userId });

            // Fetch other user's email and status
            let otherUserIdTemp = null;
            if (userRole === 'admin') {
                const userResponse = await axios.get(`http://localhost:3000/api/users/${chat.user_id}`);
                setOtherUserEmail(userResponse.data.email);
                setOtherUserId(chat.user_id);
                otherUserIdTemp = chat.user_id;
            } else {
                if (chat.admin_id) {
                    const adminResponse = await axios.get(`http://localhost:3000/api/users/${chat.admin_id}`);
                    setOtherUserEmail(adminResponse.data.email);
                    setOtherUserId(chat.admin_id);
                    otherUserIdTemp = chat.admin_id;
                } else {
                    setOtherUserEmail('No admin assigned yet');
                    setOtherUserId(null);
                    otherUserIdTemp = null;
                }
            }

            // Fetch other user's status
            if (otherUserIdTemp) {
                const otherUserResponse = await axios.get(`http://localhost:3000/api/users/${otherUserIdTemp}`);
                setOtherUserStatus(otherUserResponse.data.status);
            } else {
                setOtherUserStatus('offline');
            }
        } catch (error) {
            console.error('Error fetching messages or user email/status:', error);
        }
    };

    const sendMessage = async () => {
        if (input.trim() && selectedChat) {
            const messageData = {
                chatId: selectedChat.id,
                senderId: userId,
                message: input,
                isMarkdown: false,
            };
            try {
                await axios.post('http://localhost:3000/api/chats/message', messageData);
                setInput('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const markAsAnswered = async (chatId) => {
        try {
            await axios.put(`http://localhost:3000/api/chats/${chatId}/status`, { status: 'answered' });
            const socket = socketRef.current;
            if (socket) {
                socket.emit('statusUpdated', { chatId, status: 'answered' });
            }
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
                                className={`${parseInt(msg.sender_id) === userId ? styles.sentWrapper : styles.receivedWrapper}`}
                            >
                                <div className={`${styles.messageBubble}`}>
                                    {msg.message}
                                    {parseInt(msg.sender_id) === userId && (
                                        <span className={`${styles.doubleTicks} ${msg.isRead ? styles.blueTicks : ''}`}>
                                            ✔✔
                                        </span>
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



// import { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import Navbar from '../../components/Navbar';
// import styles from './ChatPage.module.css';

// export default function ChatPage({ userRole }) {
//     const [chats, setChats] = useState([]);
//     const [selectedChat, setSelectedChat] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [allMessages, setAllMessages] = useState({});
//     const [input, setInput] = useState('');
//     const [otherUserEmail, setOtherUserEmail] = useState('');
//     const [otherUserStatus, setOtherUserStatus] = useState('offline');
//     const [otherUserId, setOtherUserId] = useState(null);
//     const userId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('userId')) : null;

//     const socketRef = useRef(null);
//     const selectedChatRef = useRef(null);
//     const otherUserIdRef = useRef(null);
//     const prevChatIdRef = useRef(null);

//     // Update refs when state changes
//     useEffect(() => {
//         selectedChatRef.current = selectedChat;
//     }, [selectedChat]);

//     useEffect(() => {
//         otherUserIdRef.current = otherUserId;
//     }, [otherUserId]);

//     // Initialize socket connection
//     useEffect(() => {
//         if (userId && !socketRef.current) {
//             socketRef.current = io('http://localhost:3000', {
//                 query: { userId }
//             });

//             const socket = socketRef.current;

//             // Setup socket event listeners
//             socket.on('receiveMessage', (message) => {
//                 // Update `allMessages` state
//                 setAllMessages(prevAllMessages => {
//                     const chatMessages = prevAllMessages[message.chat_id] || [];
//                     return {
//                         ...prevAllMessages,
//                         [message.chat_id]: [...chatMessages, message],
//                     };
//                 });

//                 // If the message is for the currently selected chat, update `messages` state
//                 if (message.chat_id === selectedChatRef.current?.id) {
//                     setMessages(prevMessages => [...prevMessages, message]);
//                 }
//             });

//             socket.on('newChat', (chat) => {
//                 if (userRole === 'admin') {
//                     setChats(prevChats => [chat, ...prevChats]);
//                 }
//             });

//             socket.on('statusUpdated', ({ chatId, status }) => {
//                 setChats((prevChats) =>
//                     prevChats.map(chat =>
//                         chat.id === chatId ? { ...chat, status } : chat
//                     )
//                 );
//             });

//             socket.on('userStatusUpdated', ({ userId, status }) => {
//                 if (userId && otherUserIdRef.current && parseInt(userId) === parseInt(otherUserIdRef.current)) {
//                     setOtherUserStatus(status);
//                 }
//             });

//             socket.on('messagesMarkedAsRead', ({ chatId, messageIds }) => {
//                 // Update messages in `allMessages`
//                 setAllMessages(prevAllMessages => {
//                     const chatMessages = prevAllMessages[chatId];
//                     if (chatMessages) {
//                         const updatedMessages = chatMessages.map(msg =>
//                             messageIds.includes(parseInt(msg.id)) ? { ...msg, isRead: true } : msg
//                         );
//                         return { ...prevAllMessages, [chatId]: updatedMessages };
//                     }
//                     return prevAllMessages;
//                 });

//                 // If the chat is currently selected, also update `messages` state
//                 if (chatId === selectedChatRef.current?.id) {
//                     setMessages(prevMessages =>
//                         prevMessages.map(msg =>
//                             messageIds.includes(parseInt(msg.id)) ? { ...msg, isRead: true } : msg
//                         )
//                     );
//                 }
//             });
//         }

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//                 socketRef.current = null;
//             }
//         };
//     }, [userId]);

//     // Handle joining and leaving chat rooms
//     useEffect(() => {
//         const socket = socketRef.current;

//         if (socket) {
//             // Leave previous chat room
//             if (prevChatIdRef.current && prevChatIdRef.current !== selectedChat?.id?.toString()) {
//                 socket.emit('leaveChat', prevChatIdRef.current);
//             }

//             // Join new chat room
//             if (selectedChat) {
//                 socket.emit('joinChat', selectedChat.id.toString());
//                 prevChatIdRef.current = selectedChat.id.toString();
//             }
//         }

//         return () => {
//             if (socket && selectedChat) {
//                 socket.emit('leaveChat', selectedChat.id.toString());
//             }
//         };
//     }, [selectedChat]);

//     useEffect(() => {
//         if (selectedChat) {
//             const chatMessages = allMessages[selectedChat.id];
//             if (chatMessages) {
//                 setMessages(chatMessages);
//             } else {
//                 // Fetch messages if not already in `allMessages`
//                 selectChat(selectedChat);
//             }
//         }
//     }, [selectedChat, allMessages]);

//     // Fetch chats
//     useEffect(() => {
//         const fetchChats = async () => {
//             try {
//                 const response = userRole === 'admin'
//                     ? await axios.get('http://localhost:3000/api/chats/admin')
//                     : await axios.get(`http://localhost:3000/api/chats/user/${userId}`);
//                 setChats(response.data);
//             } catch (error) {
//                 console.error('Error fetching chats:', error);
//             }
//         };

//         fetchChats();
//     }, [userRole, userId]);

//     const startNewChat = async () => {
//         if (userRole === 'user') {
//             try {
//                 const response = await axios.post('http://localhost:3000/api/chats/create', { userId });
//                 const newChat = response.data;
//                 setChats(prevChats => [newChat, ...prevChats]);
//                 setSelectedChat(newChat);
//                 setMessages([]);
//             } catch (error) {
//                 console.error('Error starting new chat:', error);
//             }
//         }
//     };

//     const selectChat = async (chat) => {
//         if (!chat) return;
//         setSelectedChat(chat);

//         try {
//             // Check if messages are already in `allMessages`
//             let chatMessages = allMessages[chat.id];
//             if (!chatMessages) {
//                 // Fetch messages from the server
//                 const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);
//                 chatMessages = response.data.map(msg => ({
//                     ...msg,
//                     isRead: msg.is_read
//                 }));

//                 // Store messages in `allMessages`
//                 setAllMessages(prev => ({
//                     ...prev,
//                     [chat.id]: chatMessages
//                 }));
//             }

//             // Update `messages` state for the selected chat
//             setMessages(chatMessages);

//             // Mark messages as read in the database
//             await axios.put(`http://localhost:3000/api/chats/${chat.id}/mark-read`, { userId });

//             // Fetch other user's email and status
//             let otherUserIdTemp = null;
//             if (userRole === 'admin') {
//                 const userResponse = await axios.get(`http://localhost:3000/api/users/${chat.user_id}`);
//                 setOtherUserEmail(userResponse.data.email);
//                 setOtherUserId(chat.user_id);
//                 otherUserIdTemp = chat.user_id;
//             } else {
//                 if (chat.admin_id) {
//                     const adminResponse = await axios.get(`http://localhost:3000/api/users/${chat.admin_id}`);
//                     setOtherUserEmail(adminResponse.data.email);
//                     setOtherUserId(chat.admin_id);
//                     otherUserIdTemp = chat.admin_id;
//                 } else {
//                     setOtherUserEmail('No admin assigned yet');
//                     setOtherUserId(null);
//                     otherUserIdTemp = null;
//                 }
//             }

//             // Fetch other user's status
//             if (otherUserIdTemp) {
//                 const otherUserResponse = await axios.get(`http://localhost:3000/api/users/${otherUserIdTemp}`);
//                 setOtherUserStatus(otherUserResponse.data.status);
//             } else {
//                 setOtherUserStatus('offline');
//             }
//         } catch (error) {
//             console.error('Error fetching messages or user email/status:', error);
//         }
//     };

//     const sendMessage = async () => {
//         if (input.trim() && selectedChat) {
//             const messageData = {
//                 chatId: selectedChat.id,
//                 senderId: userId,
//                 message: input,
//                 isMarkdown: false,
//             };
//             try {
//                 await axios.post('http://localhost:3000/api/chats/message', messageData);
//                 setInput('');
//             } catch (error) {
//                 console.error('Error sending message:', error);
//             }
//         }
//     };

//     const markAsAnswered = async (chatId) => {
//         try {
//             await axios.put(`http://localhost:3000/api/chats/${chatId}/status`, { status: 'answered' });
//             const socket = socketRef.current;
//             if (socket) {
//                 socket.emit('statusUpdated', { chatId, status: 'answered' });
//             }
//         } catch (error) {
//             console.error('Error marking as answered:', error);
//         }
//     };

//     return (
//         <>
//             <Navbar />
//             <div className={styles.chatContainer}>
//                 <div className={styles.chatList}>
//                     <div className={styles.chatListHeader}>
//                         <h3>Chats</h3>
//                         {userRole === 'user' && (
//                             <button onClick={startNewChat} className={styles.newChatButton}>
//                                 Start New Chat
//                             </button>
//                         )}
//                     </div>
//                     {chats.map(chat => (
//                         <div key={chat.id} className={styles.chatItem} onClick={() => selectChat(chat)}>
//                             <p><strong>{userRole === 'admin' ? chat.userEmail : 'Admin'}</strong> - {new Date(chat.created_at).toLocaleString()}</p>
//                             <p>{chat.lastMessage || "No messages yet"}</p>
//                             {userRole === 'admin' && (
//                                 <div>
//                                     <p className={chat.status === 'unanswered' ? styles.unanswered : styles.answered}>
//                                         {chat.status === 'unanswered' ? "Unanswered" : "Answered"}
//                                     </p>
//                                     {chat.status === 'unanswered' && (
//                                         <button onClick={() => markAsAnswered(chat.id)} className={styles.answerButton}>
//                                             Mark as Answered
//                                         </button>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>

//                 <div className={styles.chatMessagesContainer}>
//                     {otherUserEmail && (
//                         <div className={styles.chatHeader}>
//                             {otherUserEmail} -
//                             <span className={otherUserStatus === 'online' ? styles.online : styles.offline}>
//                                 {otherUserStatus}
//                             </span>
//                         </div>
//                     )}
//                     <div className={styles.messageArea}>
//                         {messages.map((msg, index) => (
//                             <div
//                                 key={index}
//                                 className={`${parseInt(msg.sender_id) === userId ? styles.sentWrapper : styles.receivedWrapper}`}
//                             >
//                                 <div className={`${styles.messageBubble}`}>
//                                     {msg.message}
//                                     {parseInt(msg.sender_id) === userId && (
//                                         <span className={`${styles.doubleTicks} ${msg.isRead ? styles.blueTicks : ''}`}>
//                                             ✔✔
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <div className={styles.inputArea}>
//                         <input
//                             type="text"
//                             value={input}
//                             onChange={(e) => setInput(e.target.value)}
//                             placeholder="Write message here"
//                             className={styles.messageInput}
//                         />
//                         <button onClick={sendMessage} className={styles.sendButton}>
//                             Send
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }
