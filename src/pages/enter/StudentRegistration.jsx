// src/components/StudentRegistration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './StudentRegistration.css';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', registration_number: '',
    phone_number: '', address: ''
  });

  // Fixed: Validate that we have exactly 9 digits
  const validatePhoneDigits = (digits) => {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(digits);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhoneDigits(value);
      
      if (value.length === 9) {
        // Format as +254XXXXXXXXX (9 digits after +254)
        const fullPhoneNumber = `+254${value}`;
        setFormData({ ...formData, phone_number: fullPhoneNumber });
        setPhoneError('');
      } else if (value.length > 0 && value.length < 9) {
        setPhoneError(`Please enter ${9 - value.length} more digit(s)`);
      } else if (value.length === 0) {
        setFormData({ ...formData, phone_number: '' });
        setPhoneError('');
      }
    }
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
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
    // Only validate phone if provided and has 9 digits
    if (formData.phone_number && !validatePhoneDigits(phoneDigits)) {
      setError('Please enter a valid 9-digit phone number (e.g., 712345678)');
      return false;
    }
    if (!formData.registration_number.trim()) {
      setError('Please enter your registration number');
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
    
    
    // Remove phone_number if it's empty string
    if (!submitData.phone_number) {
      delete submitData.phone_number;
    }
    
    // Debug: Log what's being sent
    console.log('Sending registration data:', {
      ...submitData,
      password: '***',
      password2: '***'
    });
    
    const result = await registerStudent(submitData);
    
    if (result.success) {
      sessionStorage.setItem('newRegistration', 'true');
      sessionStorage.setItem('userEmail', formData.email);
      navigate('/student/enrollment');
    } else {
      console.error('Registration error details:', result.error);
      
      if (result.error) {
        // Handle Django REST framework error format
        if (typeof result.error === 'object') {
          const errorMessages = [];
          Object.keys(result.error).forEach(key => {
            if (Array.isArray(result.error[key])) {
              errorMessages.push(`${key}: ${result.error[key].join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${result.error[key]}`);
            }
          });
          setError(errorMessages.join(' | '));
        } else if (typeof result.error === 'string') {
          setError(result.error);
        } else {
          setError('Registration failed. Please check your information.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="studentreg-container">
      <div className="studentreg-card">
        <div className="studentreg-header">
          <div className="studentreg-logo">
            <span className="studentreg-logo-icon">👨‍🎓</span>
            <span className="studentreg-logo-text">Student Registration</span>
          </div>
          <h2 className="studentreg-title">Create Student Account</h2>
          <p className="studentreg-subtitle">Join our learning community today</p>
        </div>

        {error && (
          <div className="studentreg-error">
            <span className="studentreg-error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="studentreg-form">
          <div className="studentreg-form-row">
            <div className="studentreg-form-group">
              <label className="studentreg-label">First Name *</label>
              <input 
                type="text" 
                name="first_name" 
                className="studentreg-input" 
                placeholder="First Name" 
                value={formData.first_name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="studentreg-form-group">
              <label className="studentreg-label">Last Name *</label>
              <input 
                type="text" 
                name="last_name" 
                className="studentreg-input" 
                placeholder="Last Name" 
                value={formData.last_name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              className="studentreg-input" 
              placeholder="Email Address" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">Phone Number (Optional)</label>
            <div className="studentreg-phone-field">
              <div className="studentreg-phone-prefix">
                <span className="studentreg-phone-prefix-text">+254</span>
                <input 
                  type="tel" 
                  className={`studentreg-phone-input ${phoneError ? 'studentreg-input-error' : ''}`}
                  placeholder="712345678" 
                  value={phoneDigits} 
                  onChange={handlePhoneChange}
                />
              </div>
              {phoneError && (
                <div className="studentreg-phone-error">
                  <span className="studentreg-error-icon">⚠️</span> {phoneError}
                </div>
              )}
              <div className="studentreg-phone-hint">
                <small>Enter 9 digits (e.g., 712345678) - Must start with 7 or 1</small>
              </div>
            </div>
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">Registration Number *</label>
            <input 
              type="text" 
              name="registration_number" 
              className="studentreg-input" 
              placeholder="Registration Number" 
              value={formData.registration_number} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="studentreg-info-box">
            <span className="studentreg-info-icon">ℹ️</span>
            <span>You can enroll in courses after registration</span>
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">School Name (Optional)</label>
            <textarea 
              name="address" 
              className="studentreg-textarea" 
              placeholder="Example: The Nyeri National Polytechnic" 
              value={formData.address} 
              onChange={handleChange} 
              rows="3"
            />
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">Username *</label>
            <input 
              type="text" 
              name="username" 
              className="studentreg-input" 
              placeholder="Username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">Password *</label>
            <div className="studentreg-password-field">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password" 
                className="studentreg-input" 
                placeholder="Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button
                type="button"
                className="studentreg-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="studentreg-form-group">
            <label className="studentreg-label">Confirm Password *</label>
            <input 
              type="password" 
              name="password2" 
              className="studentreg-input" 
              placeholder="Confirm Password" 
              value={formData.password2} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="studentreg-password-hint">
            Password must be at least 8 characters
          </div>
          
          <button type="submit" className="studentreg-submit-btn" disabled={loading}>
            {loading ? <span className="studentreg-spinner"></span> : 'Create Account'}
          </button>
        </form>
        
        <div className="studentreg-footer">
          <p className="studentreg-login-text">
            Already have an account? 
            <button 
              type="button"
              className="studentreg-login-link"
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

export default StudentRegistration;