// src/components/TeacherPreRegistration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './TeacherPreRegistration.css';

const TeacherPreRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courseEntries, setCourseEntries] = useState([{ id: 1, name: '', code: '' }]);
  const [nextId, setNextId] = useState(2);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    school: '',
    department: '',
    email: '',
    phone_number: ''
  });

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleCourseChange = (id, field, value) => {
    setCourseEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addCourseEntry = () => {
    setCourseEntries(prev => [...prev, { id: nextId, name: '', code: '' }]);
    setNextId(prev => prev + 1);
  };

  const removeCourseEntry = (id) => {
    if (courseEntries.length === 1) {
      setError('You must have at least one course');
      return;
    }
    setCourseEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.school.trim()) {
      setError('Please enter your school/institution');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Please enter your department');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    const hasEmptyCourse = courseEntries.some(entry => !entry.name.trim() || !entry.code.trim());
    if (hasEmptyCourse) {
      setError('Please fill in all course names and codes');
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
    setSuccess('');
    
    const coursesList = courseEntries.map(entry => entry.name);
    const courseCodesList = courseEntries.map(entry => entry.code);
    
    const submitData = {
      name: formData.name,
      school: formData.school,
      department: formData.department,
      email: formData.email,
      courses: coursesList.join('||'),
      course_codes: courseCodesList.join('||')
    };
    
    try {
      const response = await api.teacherPreRegister(submitData);
      setSuccess('✓ Application submitted successfully! The admin will review your application and contact you. Check your Email for a coniemation message');
      
      // Reset form
      setFormData({
        name: '',
        school: '',
        department: '',
        email: '',
        phone_number: ''
      });
      setCourseEntries([{ id: 1, name: '', code: '' }]);
      setNextId(2);
      setPhoneDigits('');
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        const errors = error.response.data;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacherprereg-container">
      <div className="teacherprereg-card">
        <div className="teacherprereg-header">
          <div className="teacherprereg-logo">
            <span className="teacherprereg-logo-icon">👨‍🏫</span>
            <span className="teacherprereg-logo-text">Teacher Application</span>
          </div>
          <h2 className="teacherprereg-title">Apply to Become a Teacher</h2>
          <p className="teacherprereg-subtitle">Submit your details and our admin will review your application</p>
        </div>

        {error && (
          <div className="teacherprereg-error">
            <span className="teacherprereg-error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="teacherprereg-success">
            <span className="teacherprereg-success-icon">✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="teacherprereg-form">
          <div className="teacherprereg-form-group">
            <label className="teacherprereg-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="teacherprereg-input"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="teacherprereg-form-group">
            <label className="teacherprereg-label">School/Institution *</label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className="teacherprereg-input"
              placeholder="Enter your school name"
              required
            />
          </div>
          
          <div className="teacherprereg-form-group">
            <label className="teacherprereg-label">Department *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="teacherprereg-input"
              placeholder="Enter your department (e.g., Computer Science, Mathematics, Engineering)"
              required
            />
          </div>
          
          <div className="teacherprereg-form-group">
            <label className="teacherprereg-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="teacherprereg-input"
              placeholder="teacher@example.com"
              required
            />
          </div>
          
          <div className="teacherprereg-form-group">
            <label className="teacherprereg-label">Phone Number (Optional)</label>
            <div className="teacherprereg-phone-field">
              <div className="teacherprereg-phone-prefix">
                <span className="teacherprereg-phone-prefix-text">+254</span>
                <input
                  type="tel"
                  className={`teacherprereg-phone-input ${phoneError ? 'teacherprereg-input-error' : ''}`}
                  placeholder="712345678"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                />
              </div>
              {phoneError && (
                <div className="teacherprereg-phone-error">
                  <span className="teacherprereg-error-icon">⚠️</span> {phoneError}
                </div>
              )}
            </div>
          </div>
          
          <div className="teacherprereg-form-group">
            <label className="teacherprereg-label">Courses and Unit Codes *</label>
            {courseEntries.map((entry) => (
              <div key={entry.id} className="teacherprereg-course-entry">
                <div className="teacherprereg-course-row">
                  <div className="teacherprereg-course-field">
                    <input
                      type="text"
                      placeholder="Course/Unit Name (e.g., Web Development)"
                      value={entry.name}
                      onChange={(e) => handleCourseChange(entry.id, 'name', e.target.value)}
                      className="teacherprereg-input"
                      required
                    />
                  </div>
                  <div className="teacherprereg-course-field">
                    <input
                      type="text"
                      placeholder="Course/Unit Code (e.g., CSW401)"
                      value={entry.code}
                      onChange={(e) => handleCourseChange(entry.id, 'code', e.target.value)}
                      className="teacherprereg-input"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCourseEntry(entry.id)}
                    className="teacherprereg-btn-remove"
                    title="Remove course"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCourseEntry}
              className="teacherprereg-btn-add-course"
            >
              + Add Another Course
            </button>
            <small className="teacherprereg-hint-text">
              Click to add more courses if you are teaching multiple units
            </small>
          </div>
          
          <button type="submit" className="teacherprereg-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="teacherprereg-spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
        
        <div className="teacherprereg-footer">
          <p className="teacherprereg-info">
            <span className="teacherprereg-info-icon">ℹ️</span>
            After submission, our admin will review your application and contact you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherPreRegistration;