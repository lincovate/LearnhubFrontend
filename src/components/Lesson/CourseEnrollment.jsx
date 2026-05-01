// src/components/Lesson/CourseEnrollment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './CourseEnrollment.css';

const CourseEnrollment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [availableCourses, setAvailableCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    
    useEffect(() => {
        // Check if this is a new registration
        const isNewRegistration = sessionStorage.getItem('newRegistration');
        if (isNewRegistration === 'true') {
            const userEmail = sessionStorage.getItem('userEmail');
            setShowWelcome(true);
            setMessage({
                type: 'success',
                text: `Welcome ${user?.first_name || user?.username || 'Student'}! 🎉 Your account has been created successfully. Please select up to 2 courses to enroll in.`
            });
            // Clear the flag after showing
            sessionStorage.removeItem('newRegistration');
            sessionStorage.removeItem('userEmail');
            
            // Auto-hide welcome message after 5 seconds
            setTimeout(() => {
                setShowWelcome(false);
                setMessage(null);
            }, 5000);
        }
        
        fetchData();
    }, [user]);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, enrollmentsRes] = await Promise.all([
                api.getCourses(),
                api.getEnrollments()
            ]);
            setAvailableCourses(coursesRes.data);
            setMyEnrollments(enrollmentsRes.data);
            setSelectedCourses(enrollmentsRes.data.map(e => e.course));
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to load courses. Please refresh the page.' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleEnroll = async () => {
        if (selectedCourses.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one course' });
            return;
        }
        
        if (selectedCourses.length > 2) {
            setMessage({ type: 'error', text: 'You can only enroll in maximum 2 courses' });
            return;
        }
        
        setLoading(true);
        try {
            const response = await api.enrollCourses(selectedCourses);
            setMessage({ type: 'success', text: response.data.message || 'Successfully enrolled in courses!' });
            await fetchData(); // Refresh the data
            setSelectedCourses([]); // Clear selections after enrollment
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Enrollment failed' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleDropCourse = async (enrollmentId) => {
        if (window.confirm('⚠️ Warning: Once you drop a course, it will be permanently recorded. Are you sure you want to drop this course?')) {
            setLoading(true);
            try {
                await api.dropEnrollment(enrollmentId);
                setMessage({ type: 'success', text: 'Course dropped successfully' });
                await fetchData();
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to drop course' });
            } finally {
                setLoading(false);
            }
        }
    };
    
    const toggleCourseSelection = (courseId) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        } else {
            if (selectedCourses.length < 2) {
                setSelectedCourses([...selectedCourses, courseId]);
                // Clear any previous error message when selecting
                if (message?.type === 'error') {
                    setMessage(null);
                }
            } else {
                setMessage({ type: 'error', text: 'Maximum 2 courses can be selected' });
            }
        }
    };
    
    if (loading && myEnrollments.length === 0 && availableCourses.length === 0) {
        return (
            <div className="course-enrollment-loading">
                <div className="loading-spinner"></div>
                <p>Loading your courses...</p>
            </div>
        );
    }
    
    return (
        <div className="course-enrollment-container">
            <div className="course-enrollment-back-btn-container">
                <button 
                    className="course-enrollment-back-btn"
                    onClick={() => navigate('/profile')}
                >
                    ← Back to Profile
                </button>
            </div>
            <h2 className="course-enrollment-title">📚 Course Enrollment</h2>
            <p className="course-enrollment-info">You can enroll in maximum <strong>2 courses</strong>.</p>
            <p className="course-enrollment-info"> <b>Note:</b> <i>Once you enroll in a course, it will be permanently recorded in the system even if you drop it.</i></p>
            <p className="course-enrollment-info warning"><b><i>⚠️ Enroll your courses with caution! Dropped courses cannot be re-enrolled immediately.</i></b></p>
            
            {message && (
                <div className={`course-enrollment-message course-enrollment-message-${message.type}`}>
                    <span>{message.text}</span>
                    <button className="course-enrollment-message-close" onClick={() => setMessage(null)}>×</button>
                </div>
            )}
            
            <div className="course-enrollment-grid">
                <div className="course-enrollment-my-courses">
                    <h3 className="course-enrollment-section-title">My Enrolled Courses ({myEnrollments.length}/2)</h3>
                    {myEnrollments.length === 0 ? (
                        <div className="course-enrollment-empty-state">
                            <p className="course-enrollment-empty">📖 No courses enrolled yet</p>
                            <p className="course-enrollment-empty-hint">Select courses from the right panel to get started!</p>
                        </div>
                    ) : (
                        <div className="course-enrollment-courses-list">
                            {myEnrollments.map(enrollment => (
                                <div key={enrollment.id} className="course-enrollment-card course-enrollment-card-enrolled">
                                    <div className="course-enrollment-card-code">{enrollment.course_code}</div>
                                    <div className="course-enrollment-card-name">{enrollment.course_name}</div>
                                    <div className="course-enrollment-card-date">
                                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                    </div>
                                    <button 
                                        className="course-enrollment-drop-btn"
                                        onClick={() => handleDropCourse(enrollment.id)}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Drop Course'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="course-enrollment-available-courses">
                    <h3 className="course-enrollment-section-title">Available Courses</h3>
                    <div className="course-enrollment-courses-list">
                        {availableCourses.length === 0 ? (
                            <div className="course-enrollment-empty-state">
                                <p className="course-enrollment-empty">No courses available</p>
                                {myEnrollments.length > 0 && (
                                    <p className="course-enrollment-empty-hint">You are enrolled in all available courses!</p>
                                )}
                            </div>
                        ) : (
                            availableCourses.map(course => {
                                const isEnrolled = myEnrollments.some(e => e.course === course.id);
                                const isSelected = selectedCourses.includes(course.id);
                                const maxReached = myEnrollments.length >= 2;
                                
                                return (
                                    <div key={course.id} className={`course-enrollment-card ${isEnrolled ? 'course-enrollment-card-disabled' : ''}`}>
                                        <div className="course-enrollment-card-code">{course.code}</div>
                                        <div className="course-enrollment-card-name">{course.name}</div>
                                        <div className="course-enrollment-card-desc">{course.description || 'No description available'}</div>
                                        {!isEnrolled && !maxReached && (
                                            <button
                                                className={`course-enrollment-select-btn ${isSelected ? 'course-enrollment-select-btn-selected' : ''}`}
                                                onClick={() => toggleCourseSelection(course.id)}
                                                disabled={loading}
                                            >
                                                {isSelected ? 'Selected ✓' : 'Select'}
                                            </button>
                                        )}
                                        {!isEnrolled && maxReached && (
                                            <button className="course-enrollment-select-btn" disabled>
                                                Max Courses Reached
                                            </button>
                                        )}
                                        {isEnrolled && <span className="course-enrollment-enrolled-badge">✓ Enrolled</span>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    {selectedCourses.length > 0 && (
                        <button 
                            className="course-enrollment-enroll-btn" 
                            onClick={handleEnroll}
                            disabled={loading}
                        >
                            {loading ? 'Enrolling...' : `Enroll in Selected Courses (${selectedCourses.length})`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollment;