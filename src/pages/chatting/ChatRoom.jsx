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
  onBack,
  loading,
  onLoadMore,
  theme,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [viewOnce, setViewOnce] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const isTeacher = room.participants?.some(
    p => p.id === currentUser.id && p.role === 'teacher'
  ) || false;

  const isMainGroup = room.is_main_group;
  const canSend = !isMainGroup || (isMainGroup && (isTeacher || room.students_can_chat));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll handler to show/hide the arrow
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollDown(!isNearBottom);
    // Load more when scrolled to top
    if (scrollTop === 0 && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && canSend) {
      onSendMessage(room.id, newMessage, viewOnce);
      setNewMessage('');
      setViewOnce(false);
      // scroll will happen via effect
    }
  };

  const handleToggleChange = (e) => {
    const checked = e.target.checked;
    if (onToggleStudentChat) {
      onToggleStudentChat(room.id, checked);
    }
  };

  return (
    <div className="chatroom-container" style={{ background: theme.background, color: theme.text }}>
      {/* Header */}
      <div className="chatroom-header" style={{ background: theme.headerBg, borderColor: theme.border }}>
        {onBack && (
          <button onClick={onBack} className="chatroom-back-btn">←</button>
        )}
        <h3 style={{ color: theme.text }}>{room.name || 'Chat'}</h3>
        {room.is_main_group && (
          <>
            <span className="chatroom-badge">Main Group</span>
            {isTeacher && (
              <div className="chatroom-toggle">
                <label style={{ color: theme.text }}>
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

      {/* Messages */}
      <div className="chatroom-messages-wrapper">
        <div
          className="chatroom-messages"
          ref={containerRef}
          onScroll={handleScroll}
        >
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
              theme={theme}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollDown && (
          <button className="chatroom-scroll-btn" onClick={scrollToBottom}>
            ↓
          </button>
        )}
      </div>

      {/* Input - sticky at bottom */}
      {canSend ? (
        <form className="chatroom-input-form" onSubmit={handleSubmit} style={{ background: theme.headerBg, borderColor: theme.border }}>
          <div className="chatroom-input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chatroom-input"
              style={{ background: theme.inputBg, color: theme.text, borderColor: theme.border }}
            />
            <label className="chatroom-viewonce-label" style={{ color: theme.text }}>
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
        <div className="chatroom-message-disabled" style={{ background: theme.headerBg, borderColor: theme.border, color: theme.text }}>
          <p>Messaging is currently disabled in this group.</p>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;