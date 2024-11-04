'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000'); // Adjust server URL

export default function ChatPage({ userRole }) {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [unansweredChats, setUnansweredChats] = useState([]);
    const [answeredChats, setAnsweredChats] = useState([]);
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    useEffect(() => {
        const fetchChats = async () => {
            if (userRole === 'admin') {
                const response = await axios.get('http://localhost:3000/api/chats/admin');
                const allChats = response.data;
                setUnansweredChats(allChats.filter(chat => chat.unanswered));
                setAnsweredChats(allChats.filter(chat => !chat.unanswered));
            } else {
                const response = await axios.get(`http://localhost:3000/api/chats/user/${userId}`);
                setChats(response.data);
            }
        };

        fetchChats();

        socket.on('receiveMessage', (message) => {
            if (message.chat_id === selectedChat?.id) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        socket.on('newChat', (chat) => {
            if (userRole === 'admin') {
                setUnansweredChats(prevChats => [...prevChats, chat]);
            }
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('newChat');
        };
    }, [userRole, userId, selectedChat?.id]);

    const startNewChat = async () => {
        if (userRole === 'user') {
            const response = await axios.post('http://localhost:3000/api/chats/create', { userId });
            const newChat = response.data;
            setChats(prevChats => [newChat, ...prevChats]);
            setSelectedChat(newChat);
            setMessages([]);
        }
    };

    const selectChat = async (chat) => {
        if (!chat) return;
        setSelectedChat(chat);
        
        try {
            const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);
            console.log("Fetched Messages for Chat:", response.data); // Debugging log
            setMessages(response.data);
            socket.emit('joinChat', chat.id.toString()); // Join chat room
        } catch (error) {
            console.error("Error fetching messages for chat:", error);
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
                const sentMessage = response.data;

                // Add only the server response message to avoid duplication
                setMessages((prevMessages) => [...prevMessages, sentMessage]);
                setInput('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Left Side: Chat List */}
            <div style={{ width: '30%', backgroundColor: '#d9f2ff', overflowY: 'auto', borderRight: '1px solid #ddd', padding: '10px' }}>
                <h3>Chats</h3>
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
                {userRole === 'admin' && (
                    <>
                        <div style={{ borderBottom: '1px solid #bbb', paddingBottom: '10px', marginBottom: '10px' }}>
                            <h4>Unanswered</h4>
                            {unansweredChats.map(chat => (
                                <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
                                    <p><strong>{chat.userEmail}</strong> - {new Date(chat.created_at).toLocaleString()}</p>
                                    <p>Last message: {chat.lastMessage || "No messages yet"}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid #bbb', paddingTop: '10px' }}>
                            <h4>Answered</h4>
                            {answeredChats.map(chat => (
                                <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
                                    <p><strong>{chat.userEmail}</strong> - {new Date(chat.created_at).toLocaleString()}</p>
                                    <p>Last message: {chat.lastMessage || "No messages yet"}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {userRole === 'user' && (
                    chats.map(chat => (
                        <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
                            <p>Admin - {new Date(chat.created_at).toLocaleString()}</p>
                            <p>Last message: {chat.lastMessage || "No messages yet"}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Right Side: Chat Messages */}
            <div style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f8e0' }}>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender_id === userId ? 'right' : 'left' }}>
                                <p style={{
                                    display: 'inline-block',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    backgroundColor: msg.sender_id === userId ? '#007bff' : '#e5e5e5',
                                    color: msg.sender_id === userId ? '#fff' : '#000',
                                    maxWidth: '70%',
                                    wordWrap: 'break-word',
                                    textAlign: msg.sender_id === userId ? 'right' : 'left'
                                }}>
                                    {msg.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#888' }}>No messages to display.</p>
                    )}
                </div>
                <div style={{ display: 'flex' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
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
    );
}

// Chat item styling
const chatItemStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff',
    marginBottom: '5px'
};







// 'use client';
// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';

// const socket = io('http://localhost:3000'); // Adjust server URL

// export default function ChatPage({ userRole }) {
//     const [chats, setChats] = useState([]);
//     const [selectedChat, setSelectedChat] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState('');
//     const [unansweredChats, setUnansweredChats] = useState([]);
//     const [answeredChats, setAnsweredChats] = useState([]);
//     const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

//     useEffect(() => {
//         const fetchChats = async () => {
//             if (userRole === 'admin') {
//                 const response = await axios.get('http://localhost:3000/api/chats/admin');
//                 const allChats = response.data;
//                 setUnansweredChats(allChats.filter(chat => chat.unanswered));
//                 setAnsweredChats(allChats.filter(chat => !chat.unanswered));
//             } else {
//                 const response = await axios.get(`http://localhost:3000/api/chats/user/${userId}`);
//                 setChats(response.data);
//             }
//         };

//         fetchChats();

//         socket.on('receiveMessage', (message) => {
//             if (message.chat_id === selectedChat?.id) {
//                 setMessages((prevMessages) => [...prevMessages, message]);
//             }
//         });

//         socket.on('newChat', (chat) => {
//             if (userRole === 'admin') {
//                 setUnansweredChats(prevChats => [...prevChats, chat]);
//             }
//         });

//         return () => {
//             socket.off('receiveMessage');
//             socket.off('newChat');
//         };
//     }, [userRole, userId, selectedChat?.id]);

//     const startNewChat = async () => {
//         if (userRole === 'user') {
//             const response = await axios.post('http://localhost:3000/api/chats/create', { userId });
//             const newChat = response.data;
//             setChats(prevChats => [newChat, ...prevChats]);
//             setSelectedChat(newChat);
//             setMessages([]);
//         }
//     };

//     const selectChat = async (chat) => {
//         if (!chat) return;
//         setSelectedChat(chat);
        
//         try {
//             const response = await axios.get(`http://localhost:3000/api/chats/${chat.id}/messages`);
//             console.log("Fetched Messages for Chat:", response.data); // Debugging log
//             setMessages(response.data);
//             socket.emit('joinChat', chat.id.toString()); // Join chat room
//         } catch (error) {
//             console.error("Error fetching messages for chat:", error);
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

//     return (
//         <div style={{ display: 'flex', height: '100vh' }}>
//             {/* Left Side: Chat List */}
//             <div style={{ width: '30%', backgroundColor: '#d9f2ff', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
//                 <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
//                     <h3>Chats</h3>
//                     {userRole === 'user' && (
//                         <button onClick={startNewChat} style={{
//                             width: '100%',
//                             padding: '10px',
//                             marginBottom: '10px',
//                             backgroundColor: '#007bff',
//                             color: '#fff',
//                             border: 'none',
//                             borderRadius: '5px',
//                             cursor: 'pointer'
//                         }}>Start New Chat</button>
//                     )}
//                     {userRole === 'admin' && (
//                         <>
//                             <h4>Unanswered</h4>
//                             {unansweredChats.map(chat => (
//                                 <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
//                                     <p>{chat.userEmail} - {chat.created_at}</p>
//                                     <p>Last message: {chat.lastMessage}</p>
//                                 </div>
//                             ))}
//                             <h4>Answered</h4>
//                             {answeredChats.map(chat => (
//                                 <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
//                                     <p>{chat.userEmail} - {chat.created_at}</p>
//                                     <p>Last message: {chat.lastMessage}</p>
//                                 </div>
//                             ))}
//                         </>
//                     )}
//                     {userRole === 'user' && (
//                         chats.map(chat => (
//                             <div key={chat.id} style={chatItemStyle} onClick={() => selectChat(chat)}>
//                                 <p>Admin - {chat.created_at}</p>
//                                 <p>Last message: {chat.lastMessage}</p>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>

//             {/* Right Side: Chat Messages */}
//             <div style={{ width: '70%', padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f8e0' }}>
//                 <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
//                     {messages.length > 0 ? (
//                         messages.map((msg, index) => (
//                             <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === userRole ? 'right' : 'left' }}>
//                                 <p style={{
//                                     display: 'inline-block',
//                                     padding: '10px',
//                                     borderRadius: '10px',
//                                     backgroundColor: msg.sender === userRole ? '#007bff' : '#e5e5e5',
//                                     color: msg.sender === userRole ? '#fff' : '#000'
//                                 }}>
//                                     {msg.message}
//                                 </p>
//                             </div>
//                         ))
//                     ) : (
//                         <p style={{ color: '#888' }}>No messages to display.</p>
//                     )}
//                 </div>
//                 <div style={{ display: 'flex' }}>
//                     <input
//                         type="text"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
//                     />
//                     <button onClick={sendMessage} style={{
//                         marginLeft: '10px',
//                         padding: '10px 20px',
//                         backgroundColor: '#007bff',
//                         color: '#fff',
//                         border: 'none',
//                         borderRadius: '5px',
//                         cursor: 'pointer'
//                     }}>Send</button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Chat item styling
// const chatItemStyle = {
//     padding: '10px',
//     cursor: 'pointer',
//     borderBottom: '1px solid #ddd',
//     backgroundColor: '#fff',
//     marginBottom: '5px'
// };
