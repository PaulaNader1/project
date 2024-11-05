'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Navbar from '../../components/Navbar';

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
        // Initialize socket connection if userId is available
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
                    setMessages((prevMessages) => [...prevMessages, message]); // Adding message again here
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

            // Real-time user status updates for the other user in the selected chat
            socket.on('userStatusUpdated', ({ status }) => {
                setOtherUserStatus(status);
            });
        }

        return () => {
            if (socket) {
                socket.off('receiveMessage');
                socket.off('newChat');
                socket.off('statusUpdated');
                socket.off('userStatusUpdated');
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
            setMessages(response.data);
            socket.emit('joinChat', chat.id.toString());

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
                socket.emit('sendMessage', response.data); // Only emit, don't update state here
                setInput(''); // Clear input after sending
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
            <div style={{ display: 'flex', height: '100vh' }}>
                {/* Left Side: Chat List */}
                <div style={{ width: '30%', backgroundColor: '#d9f2ff', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                        <h3 style={{ color: '#000' }}>Chats</h3>
                        {userRole === 'user' && (
                            <button onClick={startNewChat} style={{
                                width: '100%',
                                padding: '10px',
                                marginBottom: '10px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}>Start New Chat</button>
                        )}
                        {chats.map(chat => (
                            <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
                                <p style={{ color: '#000' }}><strong>{userRole === 'admin' ? chat.userEmail : 'Admin'}</strong> - {new Date(chat.created_at).toLocaleString()}</p>
                                <p style={{ color: '#000' }}>{chat.lastMessage || "No messages yet"}</p>
                                {userRole === 'admin' && (
                                    <div>
                                        <p style={{ color: chat.status === 'unanswered' ? 'red' : 'green' }}>
                                            {chat.status === 'unanswered' ? "Unanswered" : "Answered"}
                                        </p>
                                        {chat.status === 'unanswered' && (
                                            <button onClick={() => markAsAnswered(chat.id)} style={{
                                                padding: '5px 10px',
                                                marginTop: '5px',
                                                backgroundColor: '#28a745',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}>
                                                Mark as Answered
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
    
                {/* Right Side: Chat Messages */}
                <div style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f8e0' }}>
                    {/* Header with User Email and Status */}
                    {otherUserEmail && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            textAlign: 'center',
                        }}>
                            {otherUserEmail} - <span style={{ color: otherUserStatus === 'online' ? 'green' : 'red' }}>
                                {otherUserStatus}
                            </span>
                        </div>
                    )}
    
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                style={{ 
                                    marginBottom: '10px', 
                                    display: 'flex', 
                                    justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start' 
                                }}
                            >
                                <p style={{
                                    maxWidth: '70%',
                                    padding: '10px 15px',
                                    borderRadius: '15px',
                                    backgroundColor: msg.senderId === userId ? '#dcf8c6' : '#ffffff',
                                    color: '#000',
                                    border: msg.senderId === userId ? '1px solid #34b7f1' : '1px solid #e5e5e5',
                                    textAlign: 'left',
                                    wordBreak: 'break-word',
                                    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                                    alignSelf: msg.senderId === userId ? 'flex-end' : 'flex-start'
                                }}>
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                    </div>
    
                    <div style={{ display: 'flex' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write message here"
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ddd',
                                backgroundColor: '#e0e0e0',
                                color: '#000'
                            }}
                        />
                        <button onClick={sendMessage} style={{
                            marginLeft: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}>Send</button>
                    </div>
                </div>
            </div>
        </>
    );
    
}

// Chat item styling
const chatItemStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff',
    marginBottom: '5px',
    borderRadius: '5px',
    color: '#000'
};





// 'use client';
// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import Navbar from '../../components/Navbar';

// let socket;

// export default function ChatPage({ userRole }) {
//     const [chats, setChats] = useState([]);
//     const [selectedChat, setSelectedChat] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState('');
//     const [otherUserEmail, setOtherUserEmail] = useState('');
//     const [otherUserStatus, setOtherUserStatus] = useState('offline');
//     const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

//     useEffect(() => {
//         // Initialize socket connection if userId is available
//         if (userId) {
//             socket = io('http://localhost:3000', {
//                 query: { userId }
//             });

//             // Emit user status as online when the component mounts
//             socket.emit('setUserStatus', { userId, status: 'online' });
//         }

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

//         if (socket) {
//             socket.on('receiveMessage', (message) => {
//                 if (message.chat_id === selectedChat?.id) {
//                     setMessages((prevMessages) => [...prevMessages, message]);
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

//             // Listen for user status updates
//             socket.on('userStatusUpdated', ({ userId: updatedUserId, status }) => {
//                 if ((userRole === 'admin' && selectedChat?.user_id === updatedUserId) ||
//                     (userRole === 'user' && selectedChat?.admin_id === updatedUserId)) {
//                     setOtherUserStatus(status);
//                 }
//             });
//         }

//         // Cleanup function to set user status to offline when leaving the page
//         return () => {
//             if (socket) {
//                 socket.emit('setUserStatus', { userId, status: 'offline' });
//                 socket.off('receiveMessage');
//                 socket.off('newChat');
//                 socket.off('statusUpdated');
//                 socket.off('userStatusUpdated');
//             }
//         };
//     }, [userRole, userId, selectedChat?.id]);

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
//         setOtherUserStatus('offline');

//         try {
//             const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);
//             setMessages(response.data);
//             socket.emit('joinChat', chat.id.toString());

//             if (userRole === 'admin') {
//                 const userResponse = await axios.get(`http://localhost:3000/api/users/${chat.user_id}`);
//                 setOtherUserEmail(userResponse.data.email);
//             } else {
//                 if (chat.admin_id) {
//                     const adminResponse = await axios.get(`http://localhost:3000/api/users/${chat.admin_id}`);
//                     setOtherUserEmail(adminResponse.data.email);
//                 } else {
//                     setOtherUserEmail('No admin assigned yet');
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching messages or user email:', error);
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
//                 const response = await axios.post('http://localhost:3000/api/chats/message', messageData);
//                 const sentMessage = response.data;
//                 setMessages((prevMessages) => [...prevMessages, sentMessage]);
//                 setInput('');
//                 socket.emit('sendMessage', sentMessage);
//             } catch (error) {
//                 console.error('Error sending message:', error);
//             }
//         }
//     };

//     const markAsAnswered = async (chatId) => {
//         try {
//             await axios.put(`http://localhost:3000/api/chats/${chatId}/status`, { status: 'answered' });
//             socket.emit('statusUpdated', { chatId, status: 'answered' });
//         } catch (error) {
//             console.error('Error marking as answered:', error);
//         }
//     };

//     return (
//         <>
//             <Navbar />
//             <div style={{ display: 'flex', height: '100vh' }}>
//                 <div style={{ width: '30%', backgroundColor: '#d9f2ff', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
//                     <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
//                         <h3 style={{ color: '#000' }}>Chats</h3>
//                         {userRole === 'user' && (
//                             <button onClick={startNewChat} style={{
//                                 width: '100%',
//                                 padding: '10px',
//                                 marginBottom: '10px',
//                                 backgroundColor: '#007bff',
//                                 color: '#fff',
//                                 border: 'none',
//                                 borderRadius: '5px',
//                                 cursor: 'pointer'
//                             }}>Start New Chat</button>
//                         )}
//                         {chats.map(chat => (
//                             <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
//                                 <p style={{ color: '#000' }}><strong>{userRole === 'admin' ? chat.userEmail : 'Admin'}</strong> - {new Date(chat.created_at).toLocaleString()}</p>
//                                 <p style={{ color: '#000' }}>{chat.lastMessage || "No messages yet"}</p>
//                                 {userRole === 'admin' && (
//                                     <div>
//                                         <p style={{ color: chat.status === 'unanswered' ? 'red' : 'green' }}>
//                                             {chat.status === 'unanswered' ? "Unanswered" : "Answered"}
//                                         </p>
//                                         {chat.status === 'unanswered' && (
//                                             <button onClick={() => markAsAnswered(chat.id)} style={{
//                                                 padding: '5px 10px',
//                                                 marginTop: '5px',
//                                                 backgroundColor: '#28a745',
//                                                 color: '#fff',
//                                                 border: 'none',
//                                                 borderRadius: '3px',
//                                                 cursor: 'pointer'
//                                             }}>
//                                                 Mark as Answered
//                                             </button>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f8e0' }}>
//                     {otherUserEmail && (
//                         <div style={{
//                             padding: '10px',
//                             backgroundColor: '#007bff',
//                             color: '#fff',
//                             borderRadius: '5px',
//                             marginBottom: '10px',
//                             textAlign: 'center',
//                         }}>
//                             {otherUserEmail} - <span style={{ color: otherUserStatus === 'online' ? 'green' : 'red' }}>
//                                 {otherUserStatus}
//                             </span>
//                         </div>
//                     )}

//                     <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
//                         {messages.map((msg, index) => (
//                             <div key={index} style={{ marginBottom: '10px', textAlign: msg.senderId === userId ? 'right' : 'left' }}>
//                                 <p style={{
//                                     display: 'inline-block',
//                                     padding: '10px',
//                                     borderRadius: '10px',
//                                     backgroundColor: msg.senderId === userId ? '#007bff' : '#e5e5e5',
//                                     color: msg.senderId === userId ? '#fff' : '#000',
//                                     wordBreak: 'break-word'
//                                 }}>
//                                     {msg.message}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>

//                     <div style={{ display: 'flex' }}>
//                         <input
//                             type="text"
//                             value={input}
//                             onChange={(e) => setInput(e.target.value)}
//                             placeholder="Write message here"
//                             style={{
//                                 flex: 1,
//                                 padding: '10px',
//                                 borderRadius: '5px',
//                                 border: '1px solid #ddd',
//                                 backgroundColor: '#e0e0e0',
//                                 color: '#000'
//                             }}
//                         />
//                         <button onClick={sendMessage} style={{
//                             marginLeft: '10px',
//                             padding: '10px 20px',
//                             backgroundColor: '#007bff',
//                             color: '#fff',
//                             border: 'none',
//                             borderRadius: '5px',
//                             cursor: 'pointer'
//                         }}>Send</button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// // Chat item styling
// const chatItemStyle = {
//     padding: '10px',
//     cursor: 'pointer',
//     borderBottom: '1px solid #ddd',
//     backgroundColor: '#fff',
//     marginBottom: '5px',
//     borderRadius: '5px',
//     color: '#000' // Set text color to black
// };

