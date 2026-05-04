// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentRegistration from './enter/StudentRegistration';
import TeacherPreRegistration from './TeacherPreRegistration';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);

  // If a user type is selected, show the respective registration form
  if (userType) {
    return (
      <>
        {/* Back button to return to role selection */}
        <button 
          className="register-back-btn"
          onClick={() => setUserType(null)}
        >
          ← Back to Role Selection
        </button>
        {userType === 'student' ? <StudentRegistration /> : <TeacherPreRegistration />}
      </>
    );
  }

  // Otherwise, show the role selection screen
  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <span className="register-logo-icon">📚</span>
            <span className="register-logo-text">Lincovate LearnHub</span>
          </div>
          <h2 className="register-title">Create an Account</h2>
          <p className="register-subtitle">Join our learning community today</p>
        </div>

        <div className="register-role-selector">
          <div 
            className="register-role-card"
            onClick={() => setUserType('student')}
          >
            <div className="register-role-icon">👨‍🎓</div>
            <h3 className="register-role-title">Student</h3>
            <p className="register-role-description"><b>I am in the system</b> and I want to learn</p>
          </div>
          <div 
            className="register-role-card"
            onClick={() => setUserType('teacher')}
          >
            <div className="register-role-icon">👨‍🏫</div>
            <h3 className="register-role-title">Teacher</h3>
            <p className="register-role-description"><b>I am in the system</b> and I want to teach</p>
          </div>
        </div>

        <div className="register-footer">
          <p className="register-login-text">
            Already have an account? 
            <button 
              type="button"
              className="register-login-link"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;