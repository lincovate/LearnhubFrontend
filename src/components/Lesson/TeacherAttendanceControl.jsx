import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherAttendanceControl.css';

const TeacherAttendanceControl = () => {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time_slot: '07:30-09:00',
        duration_minutes: 30
    });
    
    const timeSlots = [
        '07:30-09:00', '09:00-10:30', '11:00-12:30',
        '12:30-14:00', '14:00-15:30', '15:30-17:00'
    ];
    
    useEffect(() => {
        fetchCourses();
    }, []);
    
    const fetchCourses = async () => {
        try {
            const response = await api.getCourses();
            setMyCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchSessions = async (courseId) => {
        try {
            const response = await api.getAttendanceSessions(courseId);
            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };
    
    const handleCourseSelect = (courseId) => {
        setSelectedCourse(courseId);
        if (courseId) {
            fetchSessions(courseId);
        } else {
            setSessions([]);
        }
    };
    
    const handleCreateSession = async (e) => {
        e.preventDefault();
        if (!selectedCourse) {
            alert('Please select a course first');
            return;
        }
        
        try {
            const response = await api.createAttendanceSession({
                course_id: selectedCourse,
                ...formData
            });
            alert('Attendance session created successfully!');
            fetchSessions(selectedCourse);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                time_slot: '07:30-09:00',
                duration_minutes: 30
            });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create session');
        }
    };
    
    const handleCloseSession = async (sessionId) => {
        if (window.confirm('Close this attendance session? Students will no longer be able to mark attendance.')) {
            try {
                await api.closeAttendanceSession(sessionId);
                fetchSessions(selectedCourse);
                alert('Session closed successfully');
            } catch (error) {
                alert('Failed to close session');
            }
        }
    };
    
    if (loading) return <div className="teacher-attendance-control-loading">Loading...</div>;
    
    return (
        <div className="teacher-attendance-control-container">
            <h2 className="teacher-attendance-control-title">🎮 Attendance Control Panel</h2>
            
            <div className="teacher-attendance-control-course-selector">
                <select 
                    onChange={(e) => handleCourseSelect(e.target.value)} 
                    value={selectedCourse || ''}
                    className="teacher-attendance-control-course-select"
                >
                    <option value="">Select Course</option>
                    {myCourses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {selectedCourse && (
                <div className="teacher-attendance-control-container-grid">
                    <div className="teacher-attendance-control-create-session">
                        <h3 className="teacher-attendance-control-section-title">Create Attendance Session</h3>
                        <form onSubmit={handleCreateSession} className="teacher-attendance-control-form">
                            <div className="teacher-attendance-control-form-group">
                                <label className="teacher-attendance-control-label">Date:</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    required
                                    className="teacher-attendance-control-input"
                                />
                            </div>
                            
                            <div className="teacher-attendance-control-form-group">
                                <label className="teacher-attendance-control-label">Time Slot:</label>
                                <select
                                    value={formData.time_slot}
                                    onChange={(e) => setFormData({...formData, time_slot: e.target.value})}
                                    required
                                    className="teacher-attendance-control-select"
                                >
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="teacher-attendance-control-form-group">
                                <label className="teacher-attendance-control-label">Duration (minutes):</label>
                                <input
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                                    min="5"
                                    max="120"
                                    required
                                    className="teacher-attendance-control-input"
                                />
                                <small className="teacher-attendance-control-hint">How long students can mark attendance</small>
                            </div>
                            
                            <button type="submit" className="teacher-attendance-control-create-btn">
                                Open Attendance Session
                            </button>
                        </form>
                    </div>
                    
                    <div className="teacher-attendance-control-sessions-list">
                        <h3 className="teacher-attendance-control-section-title">Attendance Sessions</h3>
                        {sessions.length === 0 ? (
                            <p className="teacher-attendance-control-no-sessions">No sessions created yet</p>
                        ) : (
                            <div className="teacher-attendance-control-sessions-grid">
                                {sessions.map(session => (
                                    <div 
                                        key={session.id} 
                                        className={`teacher-attendance-control-session-item ${
                                            session.is_active ? 'teacher-attendance-control-session-active' : 'teacher-attendance-control-session-closed'
                                        }`}
                                    >
                                        <div className="teacher-attendance-control-session-info">
                                            <div className="teacher-attendance-control-session-detail">
                                                <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                                            </div>
                                            <div className="teacher-attendance-control-session-detail">
                                                <strong>Time:</strong> {session.time_slot}
                                            </div>
                                            <div className="teacher-attendance-control-session-detail">
                                                <strong>Status:</strong> {session.is_active ? '🟢 Active' : '🔴 Closed'}
                                            </div>
                                            <div className="teacher-attendance-control-session-detail">
                                                <strong>Started:</strong> {new Date(session.started_at).toLocaleTimeString()}
                                            </div>
                                            {session.ended_at && (
                                                <div className="teacher-attendance-control-session-detail">
                                                    <strong>Ended:</strong> {new Date(session.ended_at).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                        {session.is_active && (
                                            <button 
                                                className="teacher-attendance-control-close-btn"
                                                onClick={() => handleCloseSession(session.id)}
                                            >
                                                Close Session
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendanceControl;