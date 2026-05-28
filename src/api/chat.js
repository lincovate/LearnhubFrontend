// src/api/chat.js
import apiClient from './client';

export const chatApi = {
  // Chat Rooms - Remove /api/ prefix since client.js already has it
  getChatRooms: () => apiClient.get('/chat-rooms/'),
  
  getChatRoom: (roomId) => apiClient.get(`/chat-rooms/${roomId}/`),
  
  createChatRoom: (data) => apiClient.post('/chat-rooms/', data),
  
  createOrGetDirectChat: (userId) => 
    apiClient.post('/chat-rooms/create_or_get_direct_chat/', { user_id: userId }),
  
  getMyCourseChats: () => apiClient.get('/chat-rooms/my_course_chats/'),
  
  // Chat Messages
  getMessages: (roomId, page = 1, pageSize = 50) => 
    apiClient.get(`/chat-messages/?room_id=${roomId}&page=${page}&page_size=${pageSize}`),
  
  sendMessage: (roomId, messageType, content, attachment = null) => {
    const formData = new FormData();
    formData.append('room_id', roomId);
    formData.append('message_type', messageType);
    if (content) formData.append('content', content);
    if (attachment) formData.append('attachment', attachment);
    
    return apiClient.post('/chat-messages/send_message/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  sendTextMessage: (roomId, content) => 
    chatApi.sendMessage(roomId, 'text', content),
  
  sendFileMessage: (roomId, file) => 
    chatApi.sendMessage(roomId, 'file', '', file),
  
  sendImageMessage: (roomId, image) => 
    chatApi.sendMessage(roomId, 'image', '', image),
  
  markMessageAsRead: (messageId) => 
    apiClient.post(`/chat-messages/${messageId}/mark_as_read/`),
  
  deleteMessage: (messageId) => 
    apiClient.post(`/chat-messages/${messageId}/delete_message/`),
  
  getUnreadCount: () => 
    apiClient.get('/chat-messages/get_unread_count/'),
  
  // Teacher-Student Chats
  getTeacherStudentChats: () => 
    apiClient.get('/teacher-student-chats/'),
  
  // Helper: Mark all messages in room as read
  markRoomAsRead: async (roomId) => {
    try {
      const messages = await chatApi.getMessages(roomId);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const unreadMessages = messages.data.filter(m => !m.is_read && m.sender !== user.id);
        for (const message of unreadMessages) {
          await chatApi.markMessageAsRead(message.id);
        }
      }
    } catch (error) {
      console.error('Failed to mark room as read:', error);
    }
  },
  
  // Helper: Get chat partner info for direct chat
  getChatPartner: (chatRoom, currentUserId) => {
    if (chatRoom.room_type !== 'direct') return null;
    return chatRoom.participants_details?.find(p => p.id !== currentUserId);
  }
};

export default chatApi;