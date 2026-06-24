import React from 'react';
import './ChatList.css';

const ChatList = ({ rooms, selectedRoom, onSelectRoom, loading }) => {
  if (loading) {
    return <div className="chatlist-loading">Loading chats...</div>;
  }

  if (rooms.length === 0) {
    return <div className="chatlist-empty">No conversations yet.</div>;
  }

  return (
    <div className="chatlist-container">
      {rooms.map(room => {
        // For direct chats, display the other person's name
        let displayName = room.name || 'Unnamed Chat';
        if (!room.is_group && room.participants && room.participants.length === 2) {
          const other = room.participants.find(p => p.id !== selectedRoom?.participants?.[0]?.id);
          if (other) displayName = other.full_name || other.username;
        }
        return (
          <div
            key={room.id}
            className={`chatlist-item ${selectedRoom?.id === room.id ? 'chatlist-item-active' : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            <div className="chatlist-avatar">👤</div>
            <div className="chatlist-info">
              <div className="chatlist-name">{displayName}</div>
              <div className="chatlist-last-msg">
                {room.last_message?.content?.slice(0, 30) || 'No messages yet'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;