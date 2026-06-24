// src/api/chatApi.js
import apiClient from './client';

export const chatApi = {
  getRooms: () => apiClient.get('/rooms/'),
  createRoom: (otherUserId) => apiClient.post('/rooms/', { other_user_id: otherUserId }),
  updateRoom: (roomId, data) => apiClient.patch(`/rooms/${roomId}/`, data),   // <-- new
  getContacts: () => apiClient.get('/rooms/contacts/'),
  getMessages: (roomId, page = 1) => apiClient.get(`/rooms/${roomId}/messages/?page=${page}`),
  sendMessage: (roomId, content, viewOnce = false) =>
    apiClient.post(`/rooms/${roomId}/messages/`, { content, view_once: viewOnce }),
  editMessage: (messageId, content) =>
    apiClient.patch(`/messages/${messageId}/`, { content }),
  deleteMessage: (messageId) =>
    apiClient.delete(`/messages/${messageId}/`),
  markViewOnce: (messageId) =>
    apiClient.patch(`/messages/${messageId}/`, { view_once: true }),
};