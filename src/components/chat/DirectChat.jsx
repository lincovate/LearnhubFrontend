// src/components/chat/DirectChat.jsx
import React, { useState, useEffect } from 'react';
import styles from './DirectChat.module.css';
import ChatRoom from './ChatRoom';
import { chatApi } from '../../api/chat';

const DirectChat = ({ currentUser }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [directChats, setDirectChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadDirectChats();
    loadUsers();
  }, []);

  const loadDirectChats = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getChatRooms();
      const direct = response.data.filter(room => room.room_type === 'direct');
      setDirectChats(direct);
    } catch (error) {
      console.error('Failed to load direct chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Fetch students and teachers based on current user role
      const { default: api } = await import('../../api/client');
      const [studentsRes, teachersRes] = await Promise.all([
        api.getStudents().catch(() => ({ data: [] })),
        api.getTeachers().catch(() => ({ data: [] }))
      ]);
      
      const allUsers = [...studentsRes.data, ...teachersRes.data];
      // Filter out current user
      const filteredUsers = allUsers.filter(user => user.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateDirectChat = async (user) => {
    setIsCreating(true);
    try {
      const response = await chatApi.createOrGetDirectChat(user.id);
      const newRoom = response.data;
      setDirectChats(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);
      setShowNewChat(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create direct chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleBack = () => {
    setSelectedRoom(null);
    loadDirectChats();
  };

  const getChatPartner = (room) => {
    return room.participants_details?.find(p => p.id !== currentUser.id);
  };

  const formatLastMessage = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.is_deleted) return 'Deleted message';
    if (lastMessage.message_type === 'image') return '📷 Photo sent';
    if (lastMessage.message_type === 'file') return '📎 File sent';
    return lastMessage.content;
  };

  const filteredDirectChats = directChats.filter(chat => {
    const partner = getChatPartner(chat);
    return partner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedRoom) {
    return (
      <div className={styles.directChat}>
        <ChatRoom
          room={selectedRoom}
          currentUser={currentUser}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className={styles.directChat}>
      <div className={styles.directChat_header}>
        <div className={styles.directChat_headerContent}>
          <h1 className={styles.directChat_title}>Direct Messages</h1>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className={styles.directChat_newChatBtn}
          >
            <svg className={styles.directChat_newChatIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>
        
        <div className={styles.directChat_search}>
          <input
            type="text"
            placeholder="Search messages or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.directChat_searchInput}
          />
          <svg className={styles.directChat_searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showNewChat && (
        <div className={styles.directChat_newChatPanel}>
          <h3 className={styles.directChat_newChatTitle}>Start a new conversation</h3>
          <div className={styles.directChat_usersList}>
            {filteredUsers.length === 0 ? (
              <p className={styles.directChat_noUsers}>No users found</p>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleCreateDirectChat(user)}
                  className={styles.directChat_userItem}
                >
                  <div className={styles.directChat_userAvatar}>
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className={styles.directChat_userInfo}>
                    <h4 className={styles.directChat_userName}>{user.full_name}</h4>
                    <p className={styles.directChat_userRole}>{user.role || 'User'}</p>
                  </div>
                  {isCreating && (
                    <div className={styles.directChat_creatingSpinner}></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.directChat_chatsList}>
        {isLoading ? (
          <div className={styles.directChat_loading}>
            <div className={styles.directChat_spinner}></div>
            <p>Loading conversations...</p>
          </div>
        ) : filteredDirectChats.length === 0 ? (
          <div className={styles.directChat_empty}>
            <svg className={styles.directChat_emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className={styles.directChat_emptyText}>No messages yet</p>
            <p className={styles.directChat_emptySubtext}>
              Click "New Chat" to start a conversation
            </p>
          </div>
        ) : (
          filteredDirectChats.map(room => {
            const partner = getChatPartner(room);
            const lastMessage = room.last_message;
            const unreadCount = room.unread_count || 0;
            
            return (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={styles.directChat_chatItem}
              >
                <div className={styles.directChat_chatAvatar}>
                  {partner?.full_name?.charAt(0) || 'U'}
                </div>
                <div className={styles.directChat_chatInfo}>
                  <div className={styles.directChat_chatHeader}>
                    <h3 className={styles.directChat_chatName}>
                      {partner?.full_name || 'Unknown User'}
                    </h3>
                    {lastMessage && (
                      <span className={styles.directChat_chatTime}>
                        {new Date(lastMessage.sent_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className={styles.directChat_chatRole}>
                    {partner?.role || 'User'}
                  </p>
                  <p className={styles.directChat_chatPreview}>
                    {formatLastMessage(lastMessage)}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <div className={styles.directChat_unreadBadge}>
                    {unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DirectChat;