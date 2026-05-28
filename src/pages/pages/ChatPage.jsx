// src/pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './ChatPage.module.css';
import ChatList from '../../components/chat/ChatList';
import ChatRoom from '../../components/chat/ChatRoom';
import CourseChat from '../../components/chat/CourseChat';
import DirectChat from '../../components/chat/DirectChat';

const ChatPage = ({ currentUser }) => {
  const [activeView, setActiveView] = useState('list'); // list, course, direct, room
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    loadUserCourses();
  }, []);

  const loadUserCourses = async () => {
    try {
      const { default: api } = await import('../../api/client');
      const response = await api.getMyCourses();
      setUserCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setActiveView('room');
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setActiveView('course');
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedRoom(null);
    setSelectedCourse(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'room':
        return (
          <ChatRoom
            room={selectedRoom}
            currentUser={currentUser}
            onBack={handleBackToList}
          />
        );
      case 'course':
        return (
          <CourseChat
            currentUser={currentUser}
            courseId={selectedCourse.id}
            courseName={selectedCourse.name}
          />
        );
      case 'direct':
        return (
          <DirectChat
            currentUser={currentUser}
            onBack={handleBackToList}
          />
        );
      default:
        return (
          <div className={styles.chatPage_layout}>
            <div className={styles.chatPage_sidebar}>
              <ChatList
                currentUser={currentUser}
                onSelectRoom={handleSelectRoom}
              />
            </div>
            <div className={styles.chatPage_main}>
              <div className={styles.chatPage_welcome}>
                <svg className={styles.chatPage_welcomeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2>Welcome to Messages</h2>
                <p>Select a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatPage_nav}>
        <button
          className={`${styles.chatPage_navBtn} ${activeView === 'list' ? styles.chatPage_navBtn_active : ''}`}
          onClick={() => setActiveView('list')}
        >
          All Chats
        </button>
        <button
          className={`${styles.chatPage_navBtn} ${activeView === 'course' ? styles.chatPage_navBtn_active : ''}`}
          onClick={() => userCourses.length > 0 && setActiveView('course')}
        >
          Course Chats
        </button>
        <button
          className={`${styles.chatPage_navBtn} ${activeView === 'direct' ? styles.chatPage_navBtn_active : ''}`}
          onClick={() => setActiveView('direct')}
        >
          Direct Messages
        </button>
      </div>
      
      {activeView === 'course' && !selectedCourse && userCourses.length > 0 && (
        <div className={styles.chatPage_courseSelect}>
          <h3>Select a Course</h3>
          <div className={styles.chatPage_courseGrid}>
            {userCourses.map(course => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={styles.chatPage_courseCard}
              >
                <div className={styles.chatPage_courseIcon}>
                  {course.name.charAt(0)}
                </div>
                <div className={styles.chatPage_courseInfo}>
                  <h4>{course.name}</h4>
                  <p>{course.code}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default ChatPage;