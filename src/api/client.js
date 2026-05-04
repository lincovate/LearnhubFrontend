// src/api/client.js
import axios from 'axios';

// Use import.meta.env for Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gith.pythonanywhere.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Functions
export const api = {
  // Auth
  login: (username, password) => apiClient.post('/login/', { username, password }),
  logout: (refreshToken) => apiClient.post('/logout/', { refresh_token: refreshToken }),
  registerStudent: (data) => apiClient.post('/register/student/', data),
  registerTeacher: (data) => apiClient.post('/register/teacher/', data),
  teacherPreRegister: (data) => apiClient.post('/api/register/', data),
  submitContact: (data) => apiClient.post('/api/contact/', data),
  
  // Password Management
  forgotPassword: (email) => apiClient.post('/forgot-password/', { email }),
  resetPassword: (token, newPassword, confirmPassword) => 
    apiClient.post('/reset-password/', { token, new_password: newPassword, confirm_password: confirmPassword }),
  changePassword: (oldPassword, newPassword, confirmPassword) => 
    apiClient.post('/change-password/', { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword }),
  
  // Profile
  getProfile: () => apiClient.get('/profile/'),
  updateProfile: (data) => apiClient.put('/profile/update/', data),
  
  // Courses
  getCourses: () => apiClient.get('/courses/'),
  getCourseStudents: (courseId) => apiClient.get(`/courses/${courseId}/students/`),
  
  // Enrollments
  getEnrollments: () => apiClient.get('/enrollments/'),
  enrollCourses: (courseIds) => apiClient.post('/enrollments/', { course_ids: courseIds }),
  dropEnrollment: (enrollmentId) => apiClient.delete(`/enrollments/${enrollmentId}/`),
  
  // Attendance Sessions
  getAttendanceSessions: (courseId = null) => {
    const url = courseId ? `/attendance-sessions/course/${courseId}/` : '/attendance-sessions/';
    return apiClient.get(url);
  },
  createAttendanceSession: (data) => apiClient.post('/attendance-sessions/', data),
  closeAttendanceSession: (sessionId) => apiClient.put(`/attendance-sessions/${sessionId}/close/`),
  
  // Student Mark Attendance
  markOwnAttendance: (sessionId) => apiClient.post('/mark-attendance/', { session_id: sessionId }),
  
  // Timetable
  getTimetable: () => apiClient.get('/timetable/'),
  getTimetableByCourse: (courseId) => apiClient.get(`/timetable/course/${courseId}/`),
  createTimetableEntry: (data) => apiClient.post('/timetable/create/', data),
  updateTimetableEntry: (entryId, data) => apiClient.put(`/timetable/${entryId}/update/`, data),
  deleteTimetableEntry: (entryId) => apiClient.delete(`/timetable/${entryId}/delete/`),
  
  // Assignments - FIXED ENDPOINTS
  getAssignments: () => apiClient.get('/assignments/'),
  getAssignmentsByCourse: (courseId) => apiClient.get(`/assignments/course/${courseId}/`),
  createAssignment: (data) => apiClient.post('/assignments/create/', data, {  // FIXED: Changed from '/assignments/' to '/assignments/create/'
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAssignment: (assignmentId, data) => apiClient.put(`/assignments/${assignmentId}/update/`, data),
  deleteAssignment: (assignmentId) => apiClient.delete(`/assignments/${assignmentId}/delete/`),
  submitAssignment: (assignmentId, formData) => 
    apiClient.post(`/assignments/${assignmentId}/submit/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateAssignmentStatus: (assignmentId, status) => apiClient.patch(`/assignments/${assignmentId}/update-status/`, { status }),
  getSubmissions: () => apiClient.get('/submissions/'),
  gradeSubmission: (submissionId, data) => apiClient.post(`/submissions/${submissionId}/grade/`, data),
  getAssignmentSubmissions: (assignmentId) => apiClient.get(`/assignments/${assignmentId}/submissions/`),
  // Add to your api object
  getDownloadUrl: (fileUrl) => {
      if (!fileUrl) return '#';
      
      // Extract parts from URL like: /media/assignments/2024/01/15/filename.pdf
      // or: http://localhost:2001/media/assignments/2024/01/15/filename.pdf
      const match = fileUrl.match(/\/media\/([^\/]+)\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/(.+)$/);
      
      if (match) {
          const [, fileType, year, month, day, filename] = match;
          return `${API_BASE_URL}/download/${fileType}/${year}/${month}/${day}/${encodeURIComponent(filename)}`;
      }
      
      // Fallback to original URL
      return fileUrl;
  },
  // Add these methods to your api object (after getDownloadUrl)

// Download file as blob with authentication
downloadFile: async (fileUrl) => {
    if (!fileUrl) return null;
    
    // Get the authenticated download URL
    let downloadUrl = fileUrl;
    const match = fileUrl.match(/\/media\/([^\/]+)\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/(.+)$/);
    
    if (match) {
        const [, fileType, year, month, day, filename] = match;
        downloadUrl = `${API_BASE_URL}/download/${fileType}/${year}/${month}/${day}/${encodeURIComponent(filename)}/`;
    }
    
    try {
        // Use apiClient directly (it includes auth token automatically)
        const response = await apiClient.get(downloadUrl, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
},

// Trigger browser download
triggerDownload: async (fileUrl, filename = null) => {
    if (!fileUrl) {
        console.error('No file URL provided');
        return false;
    }
    
    try {
        // Extract filename from URL if not provided
        if (!filename) {
            const urlParts = fileUrl.split('/');
            filename = urlParts[urlParts.length - 1];
            // Remove query parameters if any
            filename = filename.split('?')[0];
        }
        
        // Show downloading indicator (optional)
        console.log(`Downloading: ${filename}`);
        
        const blob = await api.downloadFile(fileUrl);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('Download completed successfully');
        return true;
        
    } catch (error) {
        console.error('Trigger download error:', error);
        
        // Show user-friendly error message
        if (error.response?.status === 401) {
            alert('Your session has expired. Please login again.');
            window.location.href = '/login';
        } else if (error.response?.status === 404) {
            alert('File not found. It may have been deleted.');
        } else {
            alert('Download failed. Please try again.');
        }
        return false;
    }
},

// Alternative: Open download in new tab (for files that can be viewed in browser)
openDownloadInNewTab: (fileUrl) => {
    if (!fileUrl) return;
    
    const match = fileUrl.match(/\/media\/([^\/]+)\/(\d{4})\/(\d{1,2})\/(\d{1,2})\/(.+)$/);
    if (match) {
        const [, fileType, year, month, day, filename] = match;
        const downloadUrl = `${API_BASE_URL}/download/${fileType}/${year}/${month}/${day}/${encodeURIComponent(filename)}/`;
        
        // Open in new tab (will use existing auth via interceptor? May not work for downloads)
        window.open(downloadUrl, '_blank');
    } else {
        window.open(fileUrl, '_blank');
    }
},
  // Attendance Views
  getStudentAttendance: () => apiClient.get('/attendance/student/'),
  getTeacherAttendance: (courseId = null) => {
    const url = courseId ? `/attendance/teacher/course/${courseId}/` : '/attendance/teacher/';
    return apiClient.get(url);
  },
  markTeacherAttendance: (sessionId, attendanceData) => 
    apiClient.post('/attendance/mark/', { session_id: sessionId, attendance: attendanceData }),
  getSessionAnalytics: (sessionId) => apiClient.get(`/attendance/session/${sessionId}/analytics/`),
  getCourseAttendanceAnalytics: (courseId) => apiClient.get(`/attendance/course/${courseId}/analytics/`),
  
  // Announcements
  getAnnouncements: () => apiClient.get('/announcements/'),
  getAnnouncementsByCourse: (courseId) => apiClient.get(`/announcements/course/${courseId}/`),
  createAnnouncement: (data) => apiClient.post('/announcements/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAnnouncement: (announcementId, data) => apiClient.put(`/announcements/${announcementId}/update/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAnnouncement: (announcementId) => apiClient.delete(`/announcements/${announcementId}/delete/`),
    
  // Q&A

  getQuestions: () => apiClient.get('/questions/'),
  getQuestionsByCourse: (courseId) => apiClient.get(`/questions/course/${courseId}/`),
  createQuestion: (data) => apiClient.post('/questions/create/', data),
  answerQuestion: (questionId, content) => apiClient.post(`/questions/${questionId}/answer/`, { content }),
  acceptAnswer: (answerId) => apiClient.put(`/answers/${answerId}/accept/`),
  upvoteAnswer: (answerId) => apiClient.put(`/answers/${answerId}/upvote/`),
  removeUpvote: (answerId) => apiClient.put(`/answers/${answerId}/remove-upvote/`),  
  downvoteAnswer: (answerId) => apiClient.put(`/answers/${answerId}/downvote/`),     
  removeDownvote: (answerId) => apiClient.put(`/answers/${answerId}/remove-downvote/`), 
  
  // Analytics
  getCourseGradeAnalytics: (courseId) => apiClient.get(`/analytics/grades/course/${courseId}/`),
  getStudentPerformance: (studentId) => apiClient.get(`/analytics/student/${studentId}/`),
  
  // Users
  getStudents: () => apiClient.get('/students/'),
  getStudentDetail: (studentId) => apiClient.get(`/students/${studentId}/`),
  getTeachers: () => apiClient.get('/teachers/'),
  getTeacherDetail: (teacherId) => apiClient.get(`/teachers/${teacherId}/`),
  
  // Teacher's courses
  getMyCourses: () => apiClient.get('/my-courses/'),
 
};

export default apiClient;