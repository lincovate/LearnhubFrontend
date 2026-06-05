// src/api/references.js
import apiClient from './client';

const REFERENCES_BASE = ''; // base is empty because apiClient already has /api/ prefix

export const referencesApi = {
  // ==================== BOOKS ====================
  getBooks: () => apiClient.get(`${REFERENCES_BASE}/books/`),
  getBook: (id) => apiClient.get(`${REFERENCES_BASE}/books/${id}/`),

  // Create (multipart/form-data)
  createBook: (formData) =>
    apiClient.post(`${REFERENCES_BASE}/books/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update – PATCH for partial updates (supports file replacement)
  updateBook: (id, formData) =>
    apiClient.patch(`${REFERENCES_BASE}/books/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteBook: (id) => apiClient.delete(`${REFERENCES_BASE}/books/${id}/`),

  // ==================== VIDEOS ====================
  getVideos: () => apiClient.get(`${REFERENCES_BASE}/videos/`),
  getVideo: (id) => apiClient.get(`${REFERENCES_BASE}/videos/${id}/`),

  // Create (JSON)
  createVideo: (data) => apiClient.post(`${REFERENCES_BASE}/videos/`, data),

  // Update – PATCH (JSON)
  updateVideo: (id, data) =>
    apiClient.patch(`${REFERENCES_BASE}/videos/${id}/`, data),

  deleteVideo: (id) => apiClient.delete(`${REFERENCES_BASE}/videos/${id}/`),

  // ==================== SYLLABUS ITEMS ====================
  getSyllabusItems: () => apiClient.get(`${REFERENCES_BASE}/syllabus/`),
  getSyllabusItem: (id) => apiClient.get(`${REFERENCES_BASE}/syllabus/${id}/`),

  // Create (multipart/form-data)
  createSyllabusItem: (formData) =>
    apiClient.post(`${REFERENCES_BASE}/syllabus/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update – PATCH (multipart)
  updateSyllabusItem: (id, formData) =>
    apiClient.patch(`${REFERENCES_BASE}/syllabus/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteSyllabusItem: (id) =>
    apiClient.delete(`${REFERENCES_BASE}/syllabus/${id}/`),

  // ==================== NOTES ====================
  getNotes: () => apiClient.get(`${REFERENCES_BASE}/notes/`),
  getNote: (id) => apiClient.get(`${REFERENCES_BASE}/notes/${id}/`),

  // Create (multipart/form-data)
  createNote: (formData) =>
    apiClient.post(`${REFERENCES_BASE}/notes/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update – PATCH (multipart)
  updateNote: (id, formData) =>
    apiClient.patch(`${REFERENCES_BASE}/notes/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteNote: (id) => apiClient.delete(`${REFERENCES_BASE}/notes/${id}/`),
};