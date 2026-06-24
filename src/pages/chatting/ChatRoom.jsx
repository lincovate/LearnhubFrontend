import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatRoom.css';

const ChatRoom = ({
  room,
  messages,
  currentUser,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onViewOnceMessage,
  onToggleStudentChat,
  loading,
  onLoadMore,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [viewOnce, setViewOnce] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Determine if current user is a teacher from participants list
  const isTeacher = room.participants?.some(
    p => p.id === currentUser.id && p.role === 'teacher'
  ) || false;

  const isMainGroup = room.is_main_group;
  const canSend = !isMainGroup || (isMainGroup && (isTeacher || room.students_can_chat));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && canSend) {
      onSendMessage(room.id, newMessage, viewOnce);
      setNewMessage('');
      setViewOnce(false);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    if (container.scrollTop === 0 && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  const handleToggleChange = (e) => {
    const checked = e.target.checked;
    if (onToggleStudentChat) {
      onToggleStudentChat(room.id, checked);
    }
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-header">
        <h3>{room.name || 'Chat'}</h3>
        {room.is_main_group && (
          <>
            <span className="chatroom-badge">Main Group</span>
            {isTeacher && (
              <div className="chatroom-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={room.students_can_chat || false}
                    onChange={handleToggleChange}
                  />
                  Allow students to chat
                </label>
              </div>
            )}
          </>
        )}
      </div>
      <div className="chatroom-messages" ref={containerRef} onScroll={handleScroll}>
        {loading && messages.length === 0 && (
          <div className="chatroom-loading">Loading messages...</div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={currentUser}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
            onViewOnce={onViewOnceMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {canSend ? (
        <form className="chatroom-input-form" onSubmit={handleSubmit}>
          <div className="chatroom-input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chatroom-input"
            />
            <label className="chatroom-viewonce-label">
              <input
                type="checkbox"
                checked={viewOnce}
                onChange={(e) => setViewOnce(e.target.checked)}
              />
              View Once
            </label>
            <button type="submit" className="chatroom-send-btn">Send</button>
          </div>
        </form>
      ) : (
        <div className="chatroom-message-disabled">
          <p>Messaging is currently disabled in this group.</p>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;