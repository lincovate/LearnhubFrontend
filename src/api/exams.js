// src/api/exams.js
import apiClient from './client';

export const examsApi = {
  // ----- Exams -----
  getExams: (courseId = null) => {
    const url = courseId ? `/exams/?course_id=${courseId}` : '/exams/';
    return apiClient.get(url);
  },
  getExam: (examId) => apiClient.get(`/exams/${examId}/`),
  createExam: (data) => apiClient.post('/exams/', data),
  updateExam: (examId, data) => apiClient.put(`/exams/${examId}/`, data),
  partialUpdateExam: (examId, data) => apiClient.patch(`/exams/${examId}/`, data),
  deleteExam: (examId) => apiClient.delete(`/exams/${examId}/`),

  // ----- Questions (backend uses /quiz/ endpoint) -----
  getQuestions: (examId = null) => {
    const url = examId ? `/quiz/?exam=${examId}` : '/quiz/';
    return apiClient.get(url);
  },
  getQuestion: (questionId) => apiClient.get(`/quiz/${questionId}/`),
  createQuestion: (data) => apiClient.post('/quiz/', data),
  updateQuestion: (questionId, data) => apiClient.put(`/quiz/${questionId}/`, data),
  deleteQuestion: (questionId) => apiClient.delete(`/quiz/${questionId}/`),

  // ----- Choices -----
  getChoices: (questionId = null) => {
    const url = questionId ? `/choices/?question=${questionId}` : '/choices/';
    return apiClient.get(url);
  },
  createChoice: (data) => apiClient.post('/choices/', data),
  updateChoice: (choiceId, data) => apiClient.put(`/choices/${choiceId}/`, data),
  deleteChoice: (choiceId) => apiClient.delete(`/choices/${choiceId}/`),

  // ----- Taking Exam -----
  startExam: (examId) => apiClient.get(`/exams/${examId}/take/`),
  submitExam: (examId, answers) => apiClient.post(`/exams/${examId}/submit/`, { answers }),
 
saveAnswer: (examId, questionId, answerData) => 
    apiClient.post(`/exams/${examId}/save_answer/`, { question_id: questionId, answer_data: answerData }),

  // ----- Results & Ranking -----
  getExamRanking: (examId) => apiClient.get(`/exams/${examId}/ranking/`),
  getCourseLeaderboard: (courseId) => apiClient.get(`/exams/course_leaderboard/?course_id=${courseId}`),
  getExamResults: (examId = null) => {
    const url = examId ? `/results/?exam=${examId}` : '/results/';
    return apiClient.get(url);
  },
  getStudentAnswers: (attemptId = null) => {
    const url = attemptId ? `/answers/?attempt=${attemptId}` : '/answers/';
    return apiClient.get(url);
  },

  // ----- Attempts (read-only) -----
  getAttempts: (examId = null) => {
    const url = examId ? `/attempts/?exam=${examId}` : '/attempts/';
    return apiClient.get(url);
  },

  // ----- Teacher's courses (custom endpoint) -----
  getMyCourses: () => apiClient.get('/exams/my_courses/'),

  // ----- Helper functions -----
  formatAnswers: (answers) => answers,

  getTimeRemaining: (startTime, timeLimitMinutes) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + timeLimitMinutes * 60000);
    const now = new Date();
    const remainingMs = end - now;
    if (remainingMs <= 0) return { minutes: 0, seconds: 0, expired: true };
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return { minutes, seconds, expired: false };
  },

  saveProgress: (attemptId, questionId, answerData) => {
    const key = `exam_progress_${attemptId}`;
    const progress = JSON.parse(localStorage.getItem(key) || '{}');
    progress[questionId] = answerData;
    localStorage.setItem(key, JSON.stringify(progress));
  },
  getProgress: (attemptId) => {
    const key = `exam_progress_${attemptId}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  },
  clearProgress: (attemptId) => {
    const key = `exam_progress_${attemptId}`;
    localStorage.removeItem(key);
  },
  gradeEssay: (answerId, marksAwarded) => apiClient.post(`/answers/${answerId}/grade_essay/`, { marks_awarded: marksAwarded }),
};

export default examsApi;