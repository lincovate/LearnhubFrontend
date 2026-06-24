import React from 'react';
import './ChatList.css';

const ChatList = ({ rooms, selectedRoom, onSelectRoom, loading, theme }) => {
  if (loading) {
    return <div className="chatlist-loading" style={{ color: theme.text }}>Loading chats...</div>;
  }

  if (rooms.length === 0) {
    return <div className="chatlist-empty" style={{ color: theme.text }}>No conversations yet.</div>;
  }

  return (
    <div className="chatlist-container">
      {rooms.map(room => {
        let displayName = room.name || 'Unnamed Chat';
        if (!room.is_group && room.participants && room.participants.length === 2) {
          const other = room.participants.find(p => p.id !== selectedRoom?.participants?.[0]?.id);
          if (other) displayName = other.full_name || other.username;
        }
        const unreadCount = room.unread_count || 0;

        return (
          <div
            key={room.id}
            className={`chatlist-item ${selectedRoom?.id === room.id ? 'chatlist-item-active' : ''}`}
            onClick={() => onSelectRoom(room)}
            style={{ background: selectedRoom?.id === room.id ? theme.bubbleOwn : 'transparent' }}
          >
            <div className="chatlist-avatar">👤</div>
            <div className="chatlist-info">
              <div className="chatlist-name" style={{ color: theme.text }}>{displayName}</div>
              <div className="chatlist-last-msg" style={{ color: theme.text }}>
                {room.last_message?.content?.slice(0, 30) || 'No messages yet'}
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="chatlist-unread-badge">
                {unreadCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;