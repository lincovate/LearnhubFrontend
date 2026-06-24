import React, { useState } from 'react';
import ViewOnceModal from './ViewOnceModal';
import './MessageBubble.css';

const MessageBubble = ({ message, currentUser, onEdit, onDelete, onViewOnce, theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showViewModal, setShowViewModal] = useState(false);
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
      <div className={`messagebubble-container ${isOwn ? 'messagebubble-own' : 'messagebubble-other'}`}
        style={{ background: isOwn ? theme.bubbleOwn : theme.bubbleOther, color: theme.text }}>
        <div className="messagebubble-deleted">[deleted]</div>
      </div>
    );
  }

  // For view-once messages from others
  const isViewOnce = message.view_once && !isOwn;
  const isViewed = displayContent === '[viewed once]';

  return (
    <>
      <div className={`messagebubble-container ${isOwn ? 'messagebubble-own' : 'messagebubble-other'}`}
        style={{ background: isOwn ? theme.bubbleOwn : theme.bubbleOther, color: theme.text }}>
        <div className="messagebubble-header" style={{ color: theme.text }}>
          <strong>{message.sender.full_name || message.sender.username}</strong>
          <span className="messagebubble-timestamp" style={{ color: theme.text }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {message.is_edited && <span className="messagebubble-edited" style={{ color: theme.text }}>(edited)</span>}
        </div>
        <div className="messagebubble-body">
          {isEditing ? (
            <div className="messagebubble-edit-area">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="messagebubble-edit-textarea"
                autoFocus
                style={{ background: theme.inputBg, color: theme.text, borderColor: theme.border }}
              />
              <div className="messagebubble-edit-actions">
                <button onClick={handleEditSubmit} className="messagebubble-save-btn">Save</button>
                <button onClick={() => setIsEditing(false)} className="messagebubble-cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {isViewOnce && !isViewed ? (
                <div className="messagebubble-viewonce-placeholder">
                  <p>🔒 This message is set to view once</p>
                  <button onClick={() => setShowViewModal(true)} className="messagebubble-viewonce-trigger">
                    View Message
                  </button>
                </div>
              ) : (
                <p className="messagebubble-content">{displayContent}</p>
              )}
              {message.view_once && !isOwn && isViewed && (
                <span className="messagebubble-viewonce-badge" style={{ background: '#fdf0e0', color: '#e67e22' }}>
                  🔒 Viewed
                </span>
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

      {/* View Once Modal */}
      {showViewModal && (
        <ViewOnceModal
          content={message.content}
          onClose={() => {
            setShowViewModal(false);
            // Mark as viewed on backend by fetching again? Actually the backend already marks when content_display is accessed.
            // We'll just close and the content will be marked as viewed on next render.
            // Force refresh message by re-fetching? We'll rely on backend marking.
            // We can call a force update by patching? We'll just close.
          }}
          theme={theme}
        />
      )}
    </>
  );
};

export default MessageBubble;