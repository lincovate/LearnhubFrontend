import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChatTheme } from '../../contexts/ThemeContext';
import { chatApi } from '../../api/chatApi';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import toast from 'react-hot-toast';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import ContactsModal from './ContactsModal';
import ThemeSettingsModal from './ThemeSettingsModal'; // New modal
import './ChatPage.css';

const getErrorMessage = (error, defaultMsg) => {
  return error.response?.data?.detail || error.message || defaultMsg;
};

const ChatPage = ({ embedded = false }) => {
  const { user } = useAuth();
  const { theme, currentTheme, toggleTheme } = useChatTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showList, setShowList] = useState(true);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const res = await chatApi.getRooms();
      setRooms(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load chats'));
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Load messages when room changes
  const fetchMessages = useCallback(async (roomId, pageNum = 1) => {
    if (!roomId) return;
    try {
      setLoadingMessages(true);
      const res = await chatApi.getMessages(roomId, pageNum);
      const newMessages = res.data.results || [];
      if (pageNum === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      setHasMore(!!res.data.next);
      setPage(pageNum);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load messages'));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      setMessages([]);
      fetchMessages(selectedRoom.id, 1);
      if (isMobile) setShowList(false);
    }
  }, [selectedRoom, fetchMessages, isMobile]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedRoom) return;
    const interval = setInterval(() => {
      chatApi.getMessages(selectedRoom.id, 1)
        .then(res => {
          const newMessages = res.data.results || [];
          setMessages(prev => {
            if (newMessages.length !== prev.length) {
              return newMessages;
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedRoom]);

  // ---- API Actions ----
  const handleSendMessage = async (roomId, content, viewOnce) => {
    try {
      const res = await chatApi.sendMessage(roomId, content, viewOnce);
      setMessages(prev => [...prev, res.data]);
      fetchRooms();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send message'));
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const res = await chatApi.editMessage(messageId, newContent);
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? res.data : msg))
      );
      toast.success('Message edited');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to edit message'));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatApi.deleteMessage(messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, is_deleted: true, content: '[deleted]' } : msg
        )
      );
      toast.success('Message deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete message'));
    }
  };

  const handleViewOnce = async (messageId) => {
    try {
      const res = await chatApi.markViewOnce(messageId);
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? res.data : msg))
      );
      toast.success('Message marked as view-once');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to mark as view-once'));
    }
  };

  const handleStartChat = async (otherUserId) => {
    try {
      const res = await chatApi.createRoom(otherUserId);
      const newRoom = res.data;
      setRooms(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);
      setShowContacts(false);
      toast.success('Chat started!');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create chat room'));
    }
  };

  const handleToggleStudentChat = async (roomId, value) => {
    try {
      const res = await chatApi.updateRoom(roomId, { students_can_chat: value });
      setRooms(prev => prev.map(r => r.id === roomId ? res.data : r));
      if (selectedRoom && selectedRoom.id === roomId) {
        setSelectedRoom(res.data);
      }
      toast.success(`Student chat ${value ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update setting'));
    }
  };

  const handleBackToList = () => {
    setShowList(true);
    setSelectedRoom(null);
  };

  // ---- Render ----
  if (!user) return <div className="chatpage-container">Please log in</div>;

  // Mobile layout
  if (isMobile) {
    return (
      <div className="chatpage-container chatpage-mobile" style={{ background: currentTheme.background, color: currentTheme.text }}>
        {showList ? (
          <>
            <div className="chatpage-sidebar" style={{ background: currentTheme.background, borderColor: currentTheme.border }}>
              <div className="chatpage-mobile-header">
                <h2>Chats</h2>
                <button onClick={() => setShowThemeSettings(true)} className="chatpage-settings-btn">
                  ⚙️
                </button>
              </div>
              <button className="chatpage-new-chat-btn" onClick={() => setShowContacts(true)}>
                + New Chat
              </button>
              <ChatList
                rooms={rooms}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                loading={loadingRooms}
                theme={currentTheme}
              />
            </div>
            {showContacts && (
              <ContactsModal onClose={() => setShowContacts(false)} onStartChat={(id) => {
                handleStartChat(id);
                setShowContacts(false);
              }} />
            )}
          </>
        ) : (
          <div className="chatpage-main" style={{ background: currentTheme.background }}>
            <ChatRoom
              room={selectedRoom}
              messages={messages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onViewOnceMessage={handleViewOnce}
              onToggleStudentChat={handleToggleStudentChat}
              onBack={handleBackToList}
              loading={loadingMessages}
              onLoadMore={() => {
                if (hasMore) fetchMessages(selectedRoom.id, page + 1);
              }}
              theme={currentTheme}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={`chatpage-container ${embedded ? 'chatpage-embedded' : ''}`} style={{ background: currentTheme.background, color: currentTheme.text }}>
      <div className="chatpage-sidebar" style={{ background: currentTheme.background, borderColor: currentTheme.border }}>
        <div className="chatpage-desktop-header">
          <h2>Chats</h2>
          <button onClick={() => setShowThemeSettings(true)} className="chatpage-settings-btn">
            ⚙️
          </button>
        </div>
        <button className="chatpage-new-chat-btn" onClick={() => setShowContacts(true)}>
          + New Chat
        </button>
        <ChatList
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
          loading={loadingRooms}
          theme={currentTheme}
        />
      </div>
      <div className="chatpage-main" style={{ background: currentTheme.background }}>
        {selectedRoom ? (
          <ChatRoom
            room={selectedRoom}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onViewOnceMessage={handleViewOnce}
            onToggleStudentChat={handleToggleStudentChat}
            onBack={handleBackToList}
            loading={loadingMessages}
            onLoadMore={() => {
              if (hasMore) fetchMessages(selectedRoom.id, page + 1);
            }}
            theme={currentTheme}
          />
        ) : (
          <div className="chatpage-placeholder" style={{ color: currentTheme.text }}>
            <p>Select a chat or start a new one</p>
          </div>
        )}
      </div>

      {showContacts && (
        <ContactsModal onClose={() => setShowContacts(false)} onStartChat={(id) => {
          handleStartChat(id);
          setShowContacts(false);
        }} />
      )}
      
      {showThemeSettings && (
        <ThemeSettingsModal onClose={() => setShowThemeSettings(false)} />
      )}
    </div>
  );
};

export default ChatPage;