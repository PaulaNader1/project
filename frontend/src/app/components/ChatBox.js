import { useState } from 'react';
import io from 'socket.io-client';
import { marked } from 'marked'; // Import marked for markdown formatting

const socket = io('http://localhost:3000'); // Adjust as per your server URL

const ChatBox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const formatMarkdown = (text) => marked(text); // Convert markdown to HTML

    const sendMessage = () => {
        if (input.trim()) {
            const formattedMessage = formatMarkdown(input);
            socket.emit('chatMessage', formattedMessage);
            setMessages((prev) => [...prev, { text: formattedMessage, isUser: true }]);
            setInput('');
        }
    };

    socket.on('receiveMessage', (message) => {
        setMessages((prev) => [...prev, { text: message, isUser: false }]);
    });

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{ whiteSpace: 'pre-wrap' }}
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatBox;
