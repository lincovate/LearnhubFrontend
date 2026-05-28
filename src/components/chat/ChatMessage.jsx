// src/components/chat/ChatMessage.jsx
import React, { useState, useEffect } from 'react';
import styles from './ChatMessage.module.css';
import { formatDistanceToNow } from 'date-fns';

const ChatMessage = ({ message, isOwnMessage, onMarkAsRead, onDelete }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!message.is_read && !isOwnMessage && onMarkAsRead) {
      onMarkAsRead(message.id);
    }
  }, [message.id, message.is_read, isOwnMessage, onMarkAsRead]);

  const handleDownload = async () => {
    if (message.attachment) {
      setIsDownloading(true);
      try {
        const { default: api } = await import('../../api/client');
        await api.triggerDownload(message.attachment);
      } catch (error) {
        console.error('Download failed:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Delete this message?')) {
      onDelete(message.id);
    }
  };

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(message.sent_at), { addSuffix: true });
  };

  const renderContent = () => {
    switch (message.message_type) {
      case 'text':
        return <p className={styles.chatMessage_text}>{message.content}</p>;
      
      case 'image':
        return (
          <div className={styles.chatMessage_imageContainer}>
            <img 
              src={message.attachment} 
              alt="Shared content" 
              className={styles.chatMessage_image}
              onClick={() => window.open(message.attachment, '_blank')}
            />
            {message.content && <p className={styles.chatMessage_caption}>{message.content}</p>}
          </div>
        );
      
      case 'file':
        const fileName = message.attachment?.split('/').pop() || 'Download file';
        return (
          <div className={styles.chatMessage_fileContainer}>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={styles.chatMessage_fileButton}
            >
              <svg className={styles.chatMessage_fileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span>{isDownloading ? 'Downloading...' : fileName}</span>
            </button>
            {message.content && <p className={styles.chatMessage_caption}>{message.content}</p>}
          </div>
        );
      
      default:
        return <p className={styles.chatMessage_text}>{message.content}</p>;
    }
  };

  if (message.is_deleted) {
    return (
      <div className={`${styles.chatMessage} ${styles.chatMessage_deleted}`}>
        <em>This message was deleted</em>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.chatMessage} ${isOwnMessage ? styles.chatMessage_own : styles.chatMessage_other}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwnMessage && (
        <p className={styles.chatMessage_sender}>
          {message.sender_details.full_name}
        </p>
      )}
      
      {renderContent()}
      
      <div className={styles.chatMessage_meta}>
        <span className={styles.chatMessage_time}>{getTimeAgo()}</span>
        {isOwnMessage && message.is_read && (
          <span className={styles.chatMessage_readReceipt}>✓✓</span>
        )}
        {isOwnMessage && !message.is_read && (
          <span className={styles.chatMessage_readReceipt}>✓</span>
        )}
      </div>
      
      {showActions && isOwnMessage && !message.is_deleted && (
        <button onClick={handleDelete} className={styles.chatMessage_deleteBtn}>
          <svg className={styles.chatMessage_deleteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatMessage;