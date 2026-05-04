// src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { registerStudent, registerTeacher } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('student');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', registration_number: '',
    phone_number: '', address: '', employee_id: '', department: '',
    course_ids: [], office_location: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setFetchingCourses(true);
    setError('');
    try {
      const response = await api.getCourses();
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please check if backend is running.');
    } finally {
      setFetchingCourses(false);
    }
  };

  // Validate phone number (only digits, 9 digits)
  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(number);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 9) {
      setPhoneDigits(value);
      setFormData({ ...formData, phone_number: `+254${value}` });
      if (value && !validatePhoneNumber(value)) {
        setPhoneError('Please enter 9 digits (e.g., 791192398)');
      } else {
        setPhoneError('');
      }
    }
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCourseChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData({ ...formData, course_ids: selected });
  };

// src/components/Register.jsx - Update the handleSubmit function

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phone_number) {
      if (!validatePhoneNumber(phoneDigits)) {
        setPhoneError('Please enter a valid 9-digit phone number');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    
    // Prepare data - remove course_id for students as they'll enroll later
    const submitData = { ...formData };
    if (userType === 'student') {
      delete submitData.course_id;
    }
    
    const result = userType === 'student' 
      ? await registerStudent(submitData)
      : await registerTeacher(submitData);
    
    if (result.success) {
      // For students: redirect to enrollment page instead of login
      // For teachers: redirect to login (teachers don't need enrollment)
      if (userType === 'student') {
        // Store a flag to show welcome message on enrollment page
        sessionStorage.setItem('newRegistration', 'true');
        sessionStorage.setItem('userEmail', formData.email);
        navigate('/student/enrollment');
      } else {
        navigate('/login');
      }
    } else {
      if (result.error) {
        const errors = Object.values(result.error).flat();
        setError(errors.join(', '));
      } else {
        setError('Registration failed. Please try again.');
      }
    }
    
    setLoading(false);
  };
  
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

        {error && (
          <div className="register-error">
            <span className="register-error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="register-step-indicator">
          <div className={`register-step ${step >= 1 ? 'register-step-active' : ''}`}>
            <div className="register-step-number">1</div>
            <div className="register-step-label">Select Role</div>
          </div>
          <div className={`register-step ${step >= 2 ? 'register-step-active' : ''}`}>
            <div className="register-step-number">2</div>
            <div className="register-step-label">Personal Info</div>
          </div>
          <div className={`register-step ${step >= 3 ? 'register-step-active' : ''}`}>
            <div className="register-step-number">3</div>
            <div className="register-step-label">Account Details</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 && (
            <div className="register-step-content">
              <div className="register-role-selector">
                <div 
                  className={`register-role-card ${userType === 'student' ? 'register-role-selected' : ''}`}
                  onClick={() => setUserType('student')}
                >
                  <div className="register-role-icon">👨‍🎓</div>
                  <h3 className="register-role-title">Student</h3>
                  <p className="register-role-description"><b>I am in the system</b> and I want to learn</p>
                </div>
                <div 
                  className={`register-role-card ${userType === 'teacher' ? 'register-role-selected' : ''}`}
                  onClick={() => setUserType('teacher')}
                >
                  <div className="register-role-icon">👨‍🏫</div>
                  <h3 className="register-role-title">Teacher</h3>
                  <p className="register-role-description"><b>I am in the system</b> and I want to teach</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="register-step-content">
              <div className="register-form-row">
                <input 
                  type="text" 
                  name="first_name" 
                  className="register-input" 
                  placeholder="First Name *" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="last_name" 
                  className="register-input" 
                  placeholder="Last Name *" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <input 
                type="email" 
                name="email" 
                className="register-input" 
                placeholder="Email Address *" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              
              {/* Phone Number with +254 auto-fill */}
              <div className="register-phone-field">
                <div className="register-phone-prefix">
                  <span className="register-phone-prefix-text">+254</span>
                  <input 
                    type="tel" 
                    name="phone_digits"
                    className={`register-phone-input ${phoneError ? 'register-input-error' : ''}`}
                    placeholder="712345678" 
                    value={phoneDigits} 
                    onChange={handlePhoneChange}
                  />
                </div>
                {phoneError && (
                  <div className="register-phone-error">
                    <span className="register-error-icon">⚠️</span> {phoneError}
                  </div>
                )}
                <div className="register-phone-hint">
                  <small>Enter 9 digits after +254 (e.g., 712345678)</small>
                </div>
              </div>
              
              {userType === 'student' && (
                <>
                  <input 
                    type="text" 
                    name="registration_number" 
                    className="register-input" 
                    placeholder="Registration Number *" 
                    value={formData.registration_number} 
                    onChange={handleChange} 
                    required 
                  />
                  
                  {/* Course selection removed for students - they will enroll later */}
                  <div className="register-info-box">
                    <span className="register-info-icon">ℹ️</span>
                    <span>You can enroll in courses after registration</span>
                  </div>
                  
                  <textarea 
                    name="address" 
                    className="register-textarea" 
                    placeholder="Address (Optional)" 
                    value={formData.address} 
                    onChange={handleChange} 
                    rows="3"
                  />
                </>
              )}

              {userType === 'teacher' && (
                <>
                  <div className="register-form-row">
                    <input 
                      type="text" 
                      name="employee_id" 
                      className="register-input" 
                      placeholder="Employee ID *" 
                      value={formData.employee_id} 
                      onChange={handleChange} 
                      required 
                    />
                    <input 
                      type="text" 
                      name="department" 
                      className="register-input" 
                      placeholder="Department *" 
                      value={formData.department} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  {fetchingCourses ? (
                    <div className="register-loading-courses">Loading courses...</div>
                  ) : (
                    <>
                      <select 
                        name="course_ids" 
                        className="register-select" 
                        multiple 
                        value={formData.course_ids} 
                        onChange={handleCourseChange}
                      >
                        <option value="" disabled>Select Courses (Ctrl+Click for multiple)</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </select>
                      <div className="register-hint-text">
                        Hold Ctrl (Windows) or Cmd (Mac) to select multiple courses
                      </div>
                    </>
                  )}
                  
                  <input 
                    type="text" 
                    name="office_location" 
                    className="register-input" 
                    placeholder="Office Location (Optional)" 
                    value={formData.office_location} 
                    onChange={handleChange} 
                  />
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="register-step-content">
              <input 
                type="text" 
                name="username" 
                className="register-input" 
                placeholder="Username *" 
                value={formData.username} 
                onChange={handleChange} 
                required 
              />
              <div className="register-password-field">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password" 
                  className="register-input" 
                  placeholder="Password *" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <input 
                type="password" 
                name="password2" 
                className="register-input" 
                placeholder="Confirm Password *" 
                value={formData.password2} 
                onChange={handleChange} 
                required 
              />
              <div className="register-password-hint">
                Password must be at least 8 characters
              </div>
            </div>
          )}

          <div className="register-form-actions">
            {step > 1 && (
              <button type="button" className="register-btn register-btn-outline" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button 
                type="button" 
                className="register-btn register-btn-primary" 
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && userType === 'teacher' && fetchingCourses}
              >
                Next →
              </button>
            ) : (
              <button type="submit" className="register-btn register-btn-primary" disabled={loading}>
                {loading ? <span className="register-spinner"></span> : 'Create Account'}
              </button>
            )}
          </div>
        </form>

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