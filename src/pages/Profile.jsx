// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import './Profile.css';

const Profile = () => {
  const { user, profileType, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    if (profileType === 'student') {
      fetchEnrolledCourses();
    }
  }, [profileType]);

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile();
      setProfileData(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone_number: response.data.profile?.phone_number || '',
        ...(profileType === 'student' && {
          address: response.data.profile?.address || ''
        }),
        ...(profileType === 'teacher' && {
          office_location: response.data.profile?.office_location || ''
        })
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await api.getEnrollments();
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } else {
      setError(result.error?.message || 'Failed to update profile');
    }
    
    setLoading(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleGoToEnrollment = () => {
    navigate('/student/enrollment');
  };

  if (!profileData) return <div className="profile-loader-container"><div className="profile-loader"></div></div>;

  const canEnrollMore = enrolledCourses.length < 2;

  return (
    <div className="profile-container">
      <div className="profile-card animate-slide-up">
        <div className="profile-card-header">
          <div className="profile-avatar">
            <span className="profile-avatar-text">
              {profileData.first_name?.[0]}{profileData.last_name?.[0]}
            </span>
          </div>
          <h1 className="profile-name">{profileData.first_name} {profileData.last_name}</h1>
          <p className="profile-role">{profileType === 'student' ? 'Student' : 'Teacher'}</p>
        </div>

        {error && <div className="profile-error-message">{error}</div>}
        {success && <div className="profile-success-message">{success}</div>}

        {!isEditing ? (
          <div className="profile-content">
            <div className="profile-info-section">
              <h3>Personal Information</h3>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label>Username</label>
                  <p>{profileData.username}</p>
                </div>
                <div className="profile-info-item">
                  <label>Email</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="profile-info-item">
                  <label>Phone Number</label>
                  <p>{profileData.profile?.phone_number || 'Not provided'}</p>
                </div>
                {profileType === 'student' && (
                  <>
                    <div className="profile-info-item">
                      <label>Registration Number</label>
                      <p>{profileData.profile?.registration_number}</p>
                    </div>
                    <div className="profile-info-item">
                      <label>Course</label>
                      <p>{profileData.profile?.course_name || 'Not enrolled yet'}</p>
                    </div>
                    <div className="profile-info-item">
                      <label>Address</label>
                      <p>{profileData.profile?.address || 'Not provided'}</p>
                    </div>
                  </>
                )}
                {profileType === 'teacher' && (
                  <>
                    <div className="profile-info-item">
                      <label>Employee ID</label>
                      <p>{profileData.profile?.employee_id}</p>
                    </div>
                    <div className="profile-info-item">
                      <label>Department</label>
                      <p>{profileData.profile?.department}</p>
                    </div>
                    <div className="profile-info-item">
                      <label>Office Location</label>
                      <p>{profileData.profile?.office_location || 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Enrollment Section for Students */}
            {profileType === 'student' && (
              <div className="profile-enrollment-section">
                <h3>📚 My Enrolled Courses ({enrolledCourses.length})</h3>
                {enrolledCourses.length === 0 ? (
                  <div className="profile-no-courses">
                    <p>You haven't enrolled in any courses yet.</p>
                    <button 
                      className="profile-enroll-link-btn"
                      onClick={handleGoToEnrollment}
                    >
                      Enroll in Courses
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="profile-courses-list">
                      {enrolledCourses.map((enrollment) => (
                        <div key={enrollment.id} className="profile-course-item">
                          <div className="profile-course-code">{enrollment.course_code}</div>
                          <div className="profile-course-name">{enrollment.course_name}</div>
                          <div className="profile-course-date">
                            Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {canEnrollMore && (
                      <button 
                        className="profile-enroll-more-btn"
                        onClick={handleGoToEnrollment}
                      >
                        + Enroll in  Courses ({2 - enrolledCourses.length} slot{2 - enrolledCourses.length !== 1 ? 's' : ''} left)
                      </button>
                    )}
                    {!canEnrollMore && (
                      <div className="profile-max-courses">
                        ✅ Maximum courses enrolled (2/2)
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <h3>Edit Profile</h3>
            <div className="profile-form-group">
              <input
                type="text"
                className="profile-form-input"
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="profile-form-group">
              <input
                type="text"
                className="profile-form-input"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <div className="profile-form-group">
              <input
                type="email"
                className="profile-form-input"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="profile-form-group">
              <input
                type="tel"
                className="profile-form-input"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            {profileType === 'student' && (
              <div className="profile-form-group">
                <textarea
                  className="profile-form-textarea"
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
            )}
            {profileType === 'teacher' && (
              <div className="profile-form-group">
                <input
                  type="text"
                  className="profile-form-input"
                  placeholder="Office Location"
                  value={formData.office_location}
                  onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                />
              </div>
            )}
            <div className="profile-form-actions">
              <button type="button" className="profile-btn-outline" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="profile-btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;