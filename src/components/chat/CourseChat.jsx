// src/components/chat/CourseChat.jsx
import React, { useState, useEffect } from 'react';
import styles from './CourseChat.module.css';
import ChatRoom from './ChatRoom';
import ChatList from './ChatList';
import { chatApi } from '../../api/chat';

const CourseChat = ({ currentUser, courseId, courseName }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [courseRooms, setCourseRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourseRooms();
  }, [courseId]);

  const loadCourseRooms = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getMyCourseChats();
      const rooms = response.data.filter(room => 
        room.course === courseId || room.course_details === courseName
      );
      setCourseRooms(rooms);
    } catch (error) {
      console.error('Failed to load course rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleBack = () => {
    setSelectedRoom(null);
    loadCourseRooms(); // Refresh rooms list
  };

  if (isLoading) {
    return (
      <div className={styles.courseChat}>
        <div className={styles.courseChat_loading}>
          <div className={styles.courseChat_spinner}></div>
          <p>Loading course discussions...</p>
        </div>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div className={styles.courseChat}>
        <ChatRoom 
          room={selectedRoom}
          currentUser={currentUser}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className={styles.courseChat}>
      <div className={styles.courseChat_header}>
        <h1 className={styles.courseChat_title}>{courseName} Discussions</h1>
        <p className={styles.courseChat_subtitle}>
          Chat with your classmates about course materials, assignments, and more
        </p>
      </div>

      {courseRooms.length === 0 ? (
        <div className={styles.courseChat_empty}>
          <svg className={styles.courseChat_emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <p className={styles.courseChat_emptyText}>No discussions yet</p>
          <p className={styles.courseChat_emptySubtext}>
            Check back later for course announcements and discussions
          </p>
        </div>
      ) : (
        <div className={styles.courseChat_rooms}>
          {courseRooms.map(room => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room)}
              className={styles.courseChat_roomCard}
            >
              <div className={styles.courseChat_roomIcon}>
                <svg className={styles.courseChat_roomIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className={styles.courseChat_roomInfo}>
                <h3 className={styles.courseChat_roomName}>{room.name || 'Course Discussion'}</h3>
                <p className={styles.courseChat_roomMeta}>
                  {room.participants_details?.length || 0} participants
                </p>
                {room.last_message && (
                  <p className={styles.courseChat_roomPreview}>
                    {room.last_message.content?.substring(0, 50)}...
                  </p>
                )}
              </div>
              {room.unread_count > 0 && (
                <div className={styles.courseChat_unreadBadge}>
                  {room.unread_count}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseChat;