import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './Attendance.css';

const Attendance = () => {
    const { user, isTeacher } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetailed, setShowDetailed] = useState(false);
    
    useEffect(() => {
        fetchData();
    }, [selectedCourse]);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [attendanceRes, coursesRes] = await Promise.all([
                isTeacher ? api.getTeacherAttendance(selectedCourse) : api.getStudentAttendance(),
                api.getCourses()
            ]);
            setAttendanceRecords(attendanceRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const getStatusBadgeClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'present': return 'attendance-status-present';
            case 'absent': return 'attendance-status-absent';
            case 'late': return 'attendance-status-late';
            case 'excused': return 'attendance-status-excused';
            default: return '';
        }
    };
    
    const getAttendanceRateColor = (percentage) => {
        if (percentage >= 80) return '#4caf50';
        if (percentage >= 70) return '#8bc34a';
        if (percentage >= 60) return '#ffc107';
        if (percentage >= 50) return '#ff9800';
        return '#f44336';
    };
    
    // Download attendance as CSV
    const downloadAttendanceCSV = () => {
        if (!attendanceRecords || attendanceRecords.length === 0) return;
        
        let headers = [];
        let rows = [];
        
        if (isTeacher) {
            headers = ['Student Name', 'Registration No.', 'Present', 'Absent', 'Late', 'Excused', 'Total Classes', 'Attendance Rate'];
            rows = attendanceRecords.flatMap(courseData => 
                courseData.student_summary?.map(student => [
                    student.student_name,
                    student.registration_number,
                    student.present,
                    student.absent,
                    student.late,
                    student.excused || 0,
                    student.total_possible,
                    `${student.percentage}%`
                ]) || []
            );
        } else {
            headers = ['Course', 'Date', 'Time Slot', 'Status', 'Marked At'];
            rows = attendanceRecords.flatMap(courseData => 
                courseData.attendances?.map(att => [
                    courseData.course_name,
                    att.date,
                    att.time_slot,
                    att.status,
                    new Date(att.marked_at).toLocaleString()
                ]) || []
            );
        }
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    if (loading) return <div className="attendance-loading">Loading attendance records...</div>;
    
    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h2 className="attendance-title">📋 Attendance Records</h2>
                {isTeacher && (
                    <div className="attendance-header-actions">
                        <button className="attendance-download-btn" onClick={downloadAttendanceCSV}>
                            📊 Download CSV
                        </button>
                        <button 
                            className="attendance-toggle-btn"
                            onClick={() => setShowDetailed(!showDetailed)}
                        >
                            {showDetailed ? 'Hide Detailed View' : 'Show Detailed View'}
                        </button>
                    </div>
                )}
            </div>
            
            {isTeacher && (
                <div className="attendance-course-filter">
                    <select 
                        value={selectedCourse || ''} 
                        onChange={(e) => setSelectedCourse(e.target.value || null)}
                        className="attendance-course-select"
                    >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.code} - {course.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            {attendanceRecords.length === 0 ? (
                <div className="attendance-empty">
                    <p>No attendance records found.</p>
                </div>
            ) : isTeacher ? (
                // Teacher View - Attendance Summary Table
                <div className="attendance-teacher-view">
                    {attendanceRecords.map((courseData, idx) => (
                        <div key={idx} className="attendance-course-section">
                            <h3 className="attendance-course-title">
                                {courseData.course_name} ({courseData.course_code})
                            </h3>
                            <div className="attendance-course-stats">
                                <div className="attendance-stat-card">
                                    <div className="attendance-stat-value">{courseData.statistics?.total_sessions || 0}</div>
                                    <div className="attendance-stat-label">Total Sessions</div>
                                </div>
                                <div className="attendance-stat-card">
                                    <div className="attendance-stat-value">{courseData.statistics?.attendance_percentage || 0}%</div>
                                    <div className="attendance-stat-label">Average Attendance</div>
                                </div>
                            </div>
                            
                            <div className="attendance-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Registration No.</th>
                                            <th>Present</th>
                                            <th>Absent</th>
                                            <th>Late</th>
                                            <th>Excused</th>
                                            <th>Total</th>
                                            <th>Attendance Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseData.student_summary?.map(student => (
                                            <tr key={student.student_id}>
                                                <td>{student.student_name}</td>
                                                <td>{student.registration_number}</td>
                                                <td>{student.present}</td>
                                                <td>{student.absent}</td>
                                                <td>{student.late}</td>
                                                <td>{student.excused || 0}</td>
                                                <td>{student.total_possible}</td>
                                                <td>
                                                    <div className="attendance-percentage-cell">
                                                        <div 
                                                            className="attendance-percentage-bar"
                                                            style={{ 
                                                                width: `${student.percentage}%`, 
                                                                background: getAttendanceRateColor(student.percentage)
                                                            }}
                                                        ></div>
                                                        <span className="attendance-percentage-text">{student.percentage}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {showDetailed && courseData.attendances && (
                                <div className="attendance-detailed-section">
                                    <h4 className="attendance-detailed-title">Detailed Attendance Records</h4>
                                    <div className="attendance-detailed-table-wrapper">
                                        <table className="attendance-detailed-table">
                                            <thead>
                                                <tr>
                                                    <th>Student Name</th>
                                                    <th>Date</th>
                                                    <th>Time Slot</th>
                                                    <th>Status</th>
                                                    <th>Marked At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courseData.attendances?.map((att, attIdx) => (
                                                    <tr key={attIdx}>
                                                        <td>{att.student_name}</td>
                                                        <td>{new Date(att.date).toLocaleDateString()}</td>
                                                        <td>{att.time_slot}</td>
                                                        <td>
                                                            <span className={`attendance-status-badge ${getStatusBadgeClass(att.status)}`}>
                                                                {att.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(att.marked_at).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Student View - Personal Attendance Table
                <div className="attendance-student-view">
                    {attendanceRecords.map((courseData, idx) => (
                        <div key={idx} className="attendance-student-course">
                            <h3 className="attendance-course-title">{courseData.course_name}</h3>
                            <div className="attendance-student-stats">
                                <div className="attendance-stat-circle">
                                    <svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10"/>
                                        <circle 
                                            cx="50" cy="50" r="45" fill="none" 
                                            stroke={getAttendanceRateColor(courseData.statistics?.attendance_percentage || 0)} 
                                            strokeWidth="10"
                                            strokeDasharray={`${(courseData.statistics?.attendance_percentage || 0) * 2.83} 283`}
                                            strokeDashoffset="0"
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>
                                    <div className="attendance-stat-circle-percentage">
                                        {courseData.statistics?.attendance_percentage || 0}%
                                    </div>
                                </div>
                                <div className="attendance-student-stats-details">
                                    <div className="attendance-stats-item">
                                        <span className="attendance-stats-label">Total Sessions:</span>
                                        <span className="attendance-stats-value">{courseData.statistics?.total_sessions || 0}</span>
                                    </div>
                                    <div className="attendance-stats-item">
                                        <span className="attendance-stats-label">Present:</span>
                                        <span className="attendance-stats-value attendance-stats-present">{courseData.statistics?.present_count || 0}</span>
                                    </div>
                                    <div className="attendance-stats-item">
                                        <span className="attendance-stats-label">Late:</span>
                                        <span className="attendance-stats-value attendance-stats-late">{courseData.statistics?.late_count || 0}</span>
                                    </div>
                                    <div className="attendance-stats-item">
                                        <span className="attendance-stats-label">Absent:</span>
                                        <span className="attendance-stats-value attendance-stats-absent">{courseData.statistics?.absent_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="attendance-table-wrapper">
                                <table className="attendance-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time Slot</th>
                                            <th>Status</th>
                                            <th>Marked At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courseData.attendances?.map((att, attIdx) => (
                                            <tr key={attIdx}>
                                                <td>{new Date(att.date).toLocaleDateString()}</td>
                                                <td>{att.time_slot}</td>
                                                <td>
                                                    <span className={`attendance-status-badge ${getStatusBadgeClass(att.status)}`}>
                                                        {att.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(att.marked_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Attendance;