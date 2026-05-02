import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import GradingView from './components/Lesson/GradingView';
import CourseEnrollment from './components/Lesson/CourseEnrollment';
import More from './pages/More';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="app">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }} 
      />
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Homepage />} />
               <Route path="/More" element={<More />} />
              <Route path="/About" element={<About />} />
              <Route path="/Pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Student Dashboard - Handles all /student/* routes internally */}
              <Route path="/student/*" element={
                <PrivateRoute requiredRole="student">
                  <StudentDashboard />


                </PrivateRoute>
              } />
              
              {/* Teacher Dashboard - Handles all /teacher/* routes internally */}
              <Route path="/teacher/*" element={
                <PrivateRoute requiredRole="teacher">
                  <TeacherDashboard />
                </PrivateRoute>
              } />
              
              {/* Grading View - Specific route for grading with assignment ID */}
              <Route path="/teacher/grading/:assignmentId" element={
                <PrivateRoute requiredRole="teacher">
                  <GradingView />
                </PrivateRoute>
              } />
              
              {/* Profile Route - Both Student and Teacher */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

               <Route path="/student/enrollment" element={
                <PrivateRoute requiredRole="student">
                  <CourseEnrollment />
                </PrivateRoute>
              } />

              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;