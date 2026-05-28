// src/components/chat/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatRoom.module.css';
import ChatMessage from './ChatMessage';
import { chatApi } from '../../api/chat';

const ChatRoom = ({ room, currentUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const chatPartner = room.room_type === 'direct' 
    ? room.participants_details?.find(p => p.id !== currentUser.id)
    : null;

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => loadMessages(false), 3000);
    return () => clearInterval(interval);
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (resetPage = true) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newPage = resetPage ? 1 : page;
      const response = await chatApi.getMessages(room.id, newPage, 50);
      const newMessages = response.data;
      
      if (resetPage) {
        setMessages(newMessages);
        setPage(1);
      } else if (newPage === 1) {
        // Only update if there are new messages
        if (newMessages.length > messages.length) {
          setMessages(newMessages);
        }
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setHasMore(newMessages.length === 50);
      if (!resetPage && newPage === 1) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
      loadMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    setIsSending(true);
    try {
      let response;
      if (attachment) {
        const fileType = attachment.type.startsWith('image/') ? 'image' : 'file';
        response = await chatApi.sendMessage(room.id, fileType, newMessage, attachment);
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        response = await chatApi.sendTextMessage(room.id, newMessage);
      }
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setAttachment(file);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await chatApi.markMessageAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatApi.deleteMessage(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_deleted: true, content: '[This message was deleted]' } : msg
      ));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const getHeaderTitle = () => {
    if (room.room_type === 'course') {
      return `${room.course_details} Discussion`;
    }
    return chatPartner?.full_name || 'Chat';
  };

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatRoom_header}>
        <button onClick={onBack} className={styles.chatRoom_backBtn}>
          <svg className={styles.chatRoom_backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className={styles.chatRoom_headerTitle}>{getHeaderTitle()}</h2>
          {chatPartner && (
            <p className={styles.chatRoom_headerSubtitle}>{chatPartner.role}</p>
          )}
        </div>
      </div>

      <div className={styles.chatRoom_messages} ref={messagesEndRef}>
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={styles.chatRoom_loadMore}
          >
            {isLoading ? 'Loading...' : 'Load older messages'}
          </button>
        )}
        
        <div className={styles.chatRoom_messagesList}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.sender === currentUser.id}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteMessage}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className={styles.chatRoom_inputArea}>
        {attachment && (
          <div className={styles.chatRoom_attachmentPreview}>
            <span className={styles.chatRoom_attachmentName}>{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className={styles.chatRoom_attachmentRemove}
            >
              Remove
            </button>
          </div>
        )}
        
        <div className={styles.chatRoom_inputContainer}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={styles.chatRoom_attachBtn}
          >
            <svg className={styles.chatRoom_attachIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className={styles.chatRoom_fileInput}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={styles.chatRoom_messageInput}
            disabled={isSending}
          />
          
          <button
            type="submit"
            disabled={(!newMessage.trim() && !attachment) || isSending}
            className={styles.chatRoom_sendBtn}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;