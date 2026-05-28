// src/api/reference.js
import apiClient from './client';

export const referenceApi = {
  // Categories
  getCategories: (courseId = null) => {
    const url = courseId ? `/reference-categories/?course_id=${courseId}` : '/reference-categories/';
    return apiClient.get(url);
  },
  
  createCategory: (data) => apiClient.post('/reference-categories/', data),
  
  updateCategory: (categoryId, data) => apiClient.put(`/reference-categories/${categoryId}/`, data),
  
  deleteCategory: (categoryId) => apiClient.delete(`/reference-categories/${categoryId}/`),
  
  // Reference Materials
  getMaterials: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('course_id', filters.courseId);
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('category_id', filters.categoryId);
    
    return apiClient.get(`/reference-materials/?${params.toString()}`);
  },
  
  getMaterial: (materialId) => apiClient.get(`/reference-materials/${materialId}/`),
  
  createMaterial: (formData) => {
    return apiClient.post('/reference-materials/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  updateMaterial: (materialId, data) => apiClient.put(`/reference-materials/${materialId}/`, data),
  
  deleteMaterial: (materialId) => apiClient.delete(`/reference-materials/${materialId}/`),
  
  incrementDownload: (materialId) => 
    apiClient.post(`/reference-materials/${materialId}/increment_download/`),
  
  incrementView: (materialId) => 
    apiClient.post(`/reference-materials/${materialId}/increment_view/`),
  
  getFeaturedMaterials: () => apiClient.get('/reference-materials/featured/'),
  
  // Syllabus
  getSyllabi: (courseId = null) => {
    const url = courseId ? `/syllabus/?course_id=${courseId}` : '/syllabus/';
    return apiClient.get(url);
  },
  
  getCurrentSyllabus: (courseId) => 
    apiClient.get(`/syllabus/current_syllabus/?course_id=${courseId}`),
  
  createSyllabus: (formData) => {
    return apiClient.post('/syllabus/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  updateSyllabus: (syllabusId, data) => apiClient.put(`/syllabus/${syllabusId}/`, data),
  
  deleteSyllabus: (syllabusId) => apiClient.delete(`/syllabus/${syllabusId}/`),
  
  // Helpers
  getMaterialsByType: async (courseId) => {
    const response = await referenceApi.getMaterials({ courseId });
    const materials = response.data;
    const grouped = {};
    materials.forEach(material => {
      if (!grouped[material.material_type]) {
        grouped[material.material_type] = [];
      }
      grouped[material.material_type].push(material);
    });
    return grouped;
  },
  
  getMaterialsByCategory: async (courseId) => {
    const [categoriesResponse, materialsResponse] = await Promise.all([
      referenceApi.getCategories(courseId),
      referenceApi.getMaterials({ courseId })
    ]);
    const categories = categoriesResponse.data;
    const materials = materialsResponse.data;
    const categorized = {};
    categories.forEach(category => {
      categorized[category.name] = materials.filter(m => m.category === category.id);
    });
    categorized['Uncategorized'] = materials.filter(m => !m.category);
    return categorized;
  }
};

export default referenceApi;