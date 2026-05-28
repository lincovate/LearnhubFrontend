// src/components/chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import styles from './ChatList.module.css';
import { chatApi } from '../../api/chat';
import { formatDistanceToNow } from 'date-fns';

const ChatList = ({ currentUser, onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [courseChats, setCourseChats] = useState([]);
  const [directChats, setDirectChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadChats = async () => {
    try {
      const [allRoomsResponse, courseChatsResponse] = await Promise.all([
        chatApi.getChatRooms(),
        chatApi.getMyCourseChats()
      ]);
      
      const allRooms = allRoomsResponse.data;
      setRooms(allRooms);
      setCourseChats(allRooms.filter(room => room.room_type === 'course'));
      setDirectChats(allRooms.filter(room => room.room_type === 'direct'));
      
      const totalUnread = allRooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
      localStorage.setItem('unread_chat_count', totalUnread);
      
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChatPartner = (room) => {
    return room.participants_details?.find(p => p.id !== currentUser.id);
  };

  const formatLastMessage = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.is_deleted) return 'Deleted message';
    if (lastMessage.message_type === 'image') return '📷 Photo';
    if (lastMessage.message_type === 'file') return '📎 File';
    return lastMessage.content;
  };

  const filterChats = (chats) => {
    if (!searchTerm) return chats;
    return chats.filter(chat => {
      if (chat.room_type === 'course') {
        return chat.course_details?.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        const partner = getChatPartner(chat);
        return partner?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  };

  const ChatItem = ({ room }) => {
    const partner = room.room_type === 'direct' ? getChatPartner(room) : null;
    const title = room.room_type === 'course' ? room.course_details : partner?.full_name;
    const subtitle = room.room_type === 'course' ? 'Course Discussion' : partner?.role;
    const lastMessage = room.last_message;
    const unreadCount = room.unread_count || 0;

    return (
      <div onClick={() => onSelectRoom(room)} className={styles.chatList_item}>
        <div className={styles.chatList_avatar}>
          {room.room_type === 'course' 
            ? room.course_details?.charAt(0) || 'C'
            : partner?.full_name?.charAt(0) || 'U'}
        </div>
        <div className={styles.chatList_itemContent}>
          <div className={styles.chatList_itemHeader}>
            <h3 className={styles.chatList_itemTitle}>{title}</h3>
            {lastMessage && (
              <span className={styles.chatList_itemTime}>
                {formatDistanceToNow(new Date(lastMessage.sent_at), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className={styles.chatList_itemSubtitle}>{subtitle}</p>
          <p className={styles.chatList_itemPreview}>{formatLastMessage(lastMessage)}</p>
        </div>
        {unreadCount > 0 && (
          <div className={styles.chatList_badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.chatList_loading}>
        <div className={styles.chatList_spinner}></div>
      </div>
    );
  }

  const filteredCourseChats = filterChats(courseChats);
  const filteredDirectChats = filterChats(directChats);

  return (
    <div className={styles.chatList}>
      <div className={styles.chatList_header}>
        <h1 className={styles.chatList_headerTitle}>Messages</h1>
        <div className={styles.chatList_search}>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.chatList_searchInput}
          />
          <svg className={styles.chatList_searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className={styles.chatList_body}>
        {filteredCourseChats.length > 0 && (
          <div>
            <div className={styles.chatList_sectionHeader}>
              <h2>Course Chats</h2>
            </div>
            {filteredCourseChats.map(room => (
              <ChatItem key={room.id} room={room} />
            ))}
          </div>
        )}
        
        {filteredDirectChats.length > 0 && (
          <div>
            <div className={styles.chatList_sectionHeader}>
              <h2>Direct Messages</h2>
            </div>
            {filteredDirectChats.map(room => (
              <ChatItem key={room.id} room={room} />
            ))}
          </div>
        )}
        
        {filteredCourseChats.length === 0 && filteredDirectChats.length === 0 && (
          <div className={styles.chatList_empty}>
            <svg className={styles.chatList_emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className={styles.chatList_emptyText}>No chats yet</p>
            <p className={styles.chatList_emptySubtext}>Start a conversation with your course mates or teachers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;