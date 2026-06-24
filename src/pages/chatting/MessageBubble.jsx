import React, { useState } from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, currentUser, onEdit, onDelete, onViewOnce }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isOwn = message.sender.id === currentUser.id;

  // Use content_display if available (backend handles view-once)
  const displayContent = message.content_display !== undefined
    ? message.content_display
    : message.content;

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  // Don't show deleted messages content
  if (message.is_deleted) {
    return (
      <div className={`messagebubble-container ${isOwn ? 'messagebubble-own' : 'messagebubble-other'}`}>
        <div className="messagebubble-deleted">[deleted]</div>
      </div>
    );
  }

  return (
    <div className={`messagebubble-container ${isOwn ? 'messagebubble-own' : 'messagebubble-other'}`}>
      <div className="messagebubble-header">
        <strong>{message.sender.full_name || message.sender.username}</strong>
        <span className="messagebubble-timestamp">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
        {message.is_edited && <span className="messagebubble-edited">(edited)</span>}
      </div>
      <div className="messagebubble-body">
        {isEditing ? (
          <div className="messagebubble-edit-area">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="messagebubble-edit-textarea"
              autoFocus
            />
            <div className="messagebubble-edit-actions">
              <button onClick={handleEditSubmit} className="messagebubble-save-btn">Save</button>
              <button onClick={() => setIsEditing(false)} className="messagebubble-cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="messagebubble-content">{displayContent}</p>
            {message.view_once && !isOwn && (
              <span className="messagebubble-viewonce-badge">🔒 View Once</span>
            )}
          </>
        )}
      </div>
      {isOwn && !isEditing && (
        <div className="messagebubble-actions">
          <button onClick={() => setIsEditing(true)} className="messagebubble-edit-btn">Edit</button>
          <button onClick={() => onDelete(message.id)} className="messagebubble-delete-btn">Delete</button>
          {!message.view_once && (
            <button onClick={() => onViewOnce(message.id)} className="messagebubble-viewonce-btn">
              Mark View-Once
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;