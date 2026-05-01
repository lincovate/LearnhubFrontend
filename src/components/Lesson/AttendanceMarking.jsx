import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './AttendanceMarking.css';

const AttendanceMarking = () => {
    const { user } = useAuth();
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [markedSessions, setMarkedSessions] = useState(new Set());
    
    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 10000);
        return () => clearInterval(interval);
    }, []);
    
    const fetchSessions = async () => {
        try {
            const response = await api.getAttendanceSessions();
            setActiveSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleMarkAttendance = async (sessionId) => {
        try {
            const response = await api.markOwnAttendance(sessionId);
            setMessage({ type: 'success', text: response.data.message });
            setMarkedSessions(prev => new Set([...prev, sessionId]));
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to mark attendance';
            setMessage({ type: 'error', text: errorMsg });
            setTimeout(() => setMessage(null), 5000);
        }
    };
    
    if (loading) return <div className="attendance-marking-loading">Loading sessions...</div>;
    
    return (
        <div className="attendance-marking-container">
            <h2 className="attendance-marking-title">📝 Mark Your Attendance</h2>
            
            {message && (
                <div className={`attendance-marking-message attendance-marking-message-${message.type}`}>
                    {message.text}
                </div>
            )}
            
            {activeSessions.length === 0 ? (
                <div className="attendance-marking-no-sessions">
                    <p className="attendance-marking-no-sessions-title">No active attendance sessions available.</p>
                    <p className="attendance-marking-no-sessions-subtitle">Please check with your teacher if you need to mark attendance.</p>
                </div>
            ) : (
                <div className="attendance-marking-sessions-grid">
                    {activeSessions.map(session => {
                        const isMarked = markedSessions.has(session.id);
                        
                        return (
                            <div key={session.id} className="attendance-marking-session-card">
                                <div className="attendance-marking-session-header">
                                    <h3 className="attendance-marking-session-title">{session.course_name}</h3>
                                    <span className="attendance-marking-active-badge">Active</span>
                                </div>
                                <div className="attendance-marking-session-details">
                                    <p className="attendance-marking-session-detail">📅 Date: {new Date(session.date).toLocaleDateString()}</p>
                                    <p className="attendance-marking-session-detail">⏰ Time: {session.time_slot}</p>
                                    <p className="attendance-marking-session-detail">👨‍🏫 Teacher: {session.teacher_name}</p>
                                    <p className="attendance-marking-session-detail">⏱️ Window: {session.duration_minutes} minutes</p>
                                </div>
                                <button
                                    className={`attendance-marking-mark-btn ${isMarked ? 'attendance-marking-marked' : ''}`}
                                    onClick={() => handleMarkAttendance(session.id)}
                                    disabled={!session.is_active || isMarked}
                                >
                                    {isMarked ? '✓ Attendance Marked' : 'Mark Attendance'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AttendanceMarking;