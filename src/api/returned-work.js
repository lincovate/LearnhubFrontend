// src/api/returned-work.js
import apiClient from './client';

export const returnedWorkApi = {
  // Get all returned work
  getReturnedWork: () => apiClient.get('/returned-work/'),
  
  // Get specific returned work
  getReturnedWorkItem: (id) => apiClient.get(`/returned-work/${id}/`),
  
  // Create returned work (teacher only)
  createReturnedWork: (submissionId, feedback, gradeObtained, returnedFile) => {
    const formData = new FormData();
    formData.append('submission_id', submissionId);
    if (feedback) formData.append('feedback', feedback);
    if (gradeObtained !== null && gradeObtained !== undefined) 
      formData.append('grade_obtained', gradeObtained);
    if (returnedFile) formData.append('returned_file', returnedFile);
    
    return apiClient.post('/returned-work/create_returned_work/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Mark as viewed (student only)
  markAsViewed: (id) => apiClient.post(`/returned-work/${id}/mark_as_viewed/`),
  
  // Helper: Get unviewed returned work count for student
  getUnviewedCount: async () => {
    try {
      const response = await returnedWorkApi.getReturnedWork();
      const unviewed = response.data.filter(item => !item.is_viewed);
      return unviewed.length;
    } catch {
      return 0;
    }
  },
  
  // Helper: Group by course
  groupByCourse: (returnedWork) => {
    const grouped = {};
    returnedWork.forEach(item => {
      if (!grouped[item.course_name]) {
        grouped[item.course_name] = [];
      }
      grouped[item.course_name].push(item);
    });
    return grouped;
  },
  
  // Helper: Get statistics
  getStatistics: async () => {
    try {
      const response = await returnedWorkApi.getReturnedWork();
      const items = response.data;
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      
      if (user.role === 'teacher') {
        const totalGraded = items.length;
        const averageGrade = items.reduce((sum, item) => sum + (item.grade_obtained || 0), 0) / (totalGraded || 1);
        const viewedCount = items.filter(item => item.is_viewed).length;
        const notViewedCount = totalGraded - viewedCount;
        
        return {
          totalGraded,
          averageGrade: averageGrade.toFixed(1),
          viewedCount,
          notViewedCount,
          viewRate: totalGraded > 0 ? ((viewedCount / totalGraded) * 100).toFixed(1) : 0
        };
      }
      
      const totalReturned = items.length;
      const averageGrade = items.reduce((sum, item) => sum + (item.grade_obtained || 0), 0) / (totalReturned || 1);
      const passingCount = items.filter(item => (item.grade_obtained || 0) >= 50).length;
      const highScoreCount = items.filter(item => (item.grade_obtained || 0) >= 75).length;
      
      return {
        totalReturned,
        averageGrade: averageGrade.toFixed(1),
        passingCount,
        passingRate: totalReturned > 0 ? ((passingCount / totalReturned) * 100).toFixed(1) : 0,
        highScoreCount
      };
    } catch {
      return {
        totalReturned: 0,
        averageGrade: '0',
        passingCount: 0,
        passingRate: '0',
        highScoreCount: 0
      };
    }
  }
};

export default returnedWorkApi;