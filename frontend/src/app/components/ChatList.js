// components/ChatList.js
import React from 'react';

export default function ChatList({ chats, onSelectChat }) {
    return (
        <div style={{ padding: '10px', borderRight: '1px solid #ddd', width: '300px', overflowY: 'auto' }}>
            <h3>Unanswered Chats</h3>
            {chats.filter(chat => !chat.answered).map((chat, index) => (
                <div key={index} onClick={() => onSelectChat(chat)} style={{ padding: '5px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}>
                    User {chat.userId} - New message
                </div>
            ))}
            <h3>Answered Chats</h3>
            {chats.filter(chat => chat.answered).map((chat, index) => (
                <div key={index} onClick={() => onSelectChat(chat)} style={{ padding: '5px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}>
                    User {chat.userId} - Chat history
                </div>
            ))}
        </div>
    );
}
