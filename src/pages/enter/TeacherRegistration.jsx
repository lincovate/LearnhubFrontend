// src/components/TeacherRegistration.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import './TeacherRegistration.css';

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const { registerTeacher } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', phone_number: '',
    employee_id: '', department: '', course_ids: [], office_location: ''
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

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(number);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhoneDigits(value);
      setFormData({ ...formData, phone_number: `+254${value}` });
      if (value && !validatePhoneNumber(value)) {
        setPhoneError('Please enter 9 digits (e.g., 712345678)');
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

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('Please enter your first name');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Please enter your last name');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.phone_number && !validatePhoneNumber(phoneDigits)) {
      setError('Please enter a valid 9-digit phone number');
      return false;
    }
    if (!formData.employee_id.trim()) {
      setError('Please enter your employee ID');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Please enter your department');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Please choose a username');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    const submitData = { ...formData };
    delete submitData.password2;
    
    const result = await registerTeacher(submitData);
    
    if (result.success) {
      navigate('/login');
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
    <div className="teacherreg-container">
      <div className="teacherreg-card">
        <div className="teacherreg-header">
          <div className="teacherreg-logo">
            <span className="teacherreg-logo-icon">👨‍🏫</span>
            <span className="teacherreg-logo-text">Teacher Registration</span>
          </div>
          <h2 className="teacherreg-title">Create Teacher Account</h2>
          <p className="teacherreg-subtitle">Join our teaching community today</p>
        </div>

        {error && (
          <div className="teacherreg-error">
            <span className="teacherreg-error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="teacherreg-form">
          <div className="teacherreg-form-row">
            <div className="teacherreg-form-group">
              <label className="teacherreg-label">First Name *</label>
              <input 
                type="text" 
                name="first_name" 
                className="teacherreg-input" 
                placeholder="First Name *" 
                value={formData.first_name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="teacherreg-form-group">
              <label className="teacherreg-label">Last Name *</label>
              <input 
                type="text" 
                name="last_name" 
                className="teacherreg-input" 
                placeholder="Last Name *" 
                value={formData.last_name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              className="teacherreg-input" 
              placeholder="Email Address *" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Phone Number</label>
            <div className="teacherreg-phone-field">
              <div className="teacherreg-phone-prefix">
                <span className="teacherreg-phone-prefix-text">+254</span>
                <input 
                  type="tel" 
                  className={`teacherreg-phone-input ${phoneError ? 'teacherreg-input-error' : ''}`}
                  placeholder="712345678" 
                  value={phoneDigits} 
                  onChange={handlePhoneChange}
                />
              </div>
              {phoneError && (
                <div className="teacherreg-phone-error">
                  <span className="teacherreg-error-icon">⚠️</span> {phoneError}
                </div>
              )}
              <div className="teacherreg-phone-hint">
                <small>Enter 9 digits after +254 (e.g., 712345678)</small>
              </div>
            </div>
          </div>
          
          <div className="teacherreg-form-row">
            <div className="teacherreg-form-group">
              <label className="teacherreg-label">Employee ID *</label>
              <input 
                type="text" 
                name="employee_id" 
                className="teacherreg-input" 
                placeholder="Employee ID *" 
                value={formData.employee_id} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="teacherreg-form-group">
              <label className="teacherreg-label">Department *</label>
              <input 
                type="text" 
                name="department" 
                className="teacherreg-input" 
                placeholder="Department *" 
                value={formData.department} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Courses You'll Teach *</label>
            {fetchingCourses ? (
              <div className="teacherreg-loading-courses">Loading courses...</div>
            ) : (
              <>
                <select 
                  name="course_ids" 
                  className="teacherreg-select" 
                  multiple 
                  value={formData.course_ids} 
                  onChange={handleCourseChange}
                  required
                >
                  <option value="" disabled>Select Courses (Ctrl+Click for multiple)</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                <div className="teacherreg-hint-text">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple courses
                </div>
              </>
            )}
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Office Location (Optional)</label>
            <input 
              type="text" 
              name="office_location" 
              className="teacherreg-input" 
              placeholder="Office Location (Optional)" 
              value={formData.office_location} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Username *</label>
            <input 
              type="text" 
              name="username" 
              className="teacherreg-input" 
              placeholder="Username *" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Password *</label>
            <div className="teacherreg-password-field">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password" 
                className="teacherreg-input" 
                placeholder="Password *" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button
                type="button"
                className="teacherreg-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="teacherreg-form-group">
            <label className="teacherreg-label">Confirm Password *</label>
            <input 
              type="password" 
              name="password2" 
              className="teacherreg-input" 
              placeholder="Confirm Password *" 
              value={formData.password2} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="teacherreg-password-hint">
            Password must be at least 8 characters
          </div>
          
          <button type="submit" className="teacherreg-submit-btn" disabled={loading}>
            {loading ? <span className="teacherreg-spinner"></span> : 'Create Account'}
          </button>
        </form>
        
        <div className="teacherreg-footer">
          <p className="teacherreg-login-text">
            Already have an account? 
            <button 
              type="button"
              className="teacherreg-login-link"
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

export default TeacherRegistration;