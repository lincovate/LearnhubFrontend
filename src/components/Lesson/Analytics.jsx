import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './Analytics.css';

const Analytics = () => {
    const { user, getProfileType, isTeacher, isStudent } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [gradeAnalytics, setGradeAnalytics] = useState(null);
    const [attendanceAnalytics, setAttendanceAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeAnalytic, setActiveAnalytic] = useState('grades');
    const [detailedAttendance, setDetailedAttendance] = useState([]);
    const [showDetailedAttendance, setShowDetailedAttendance] = useState(false);
    
    const profileType = getProfileType();
    
    useEffect(() => {
        fetchCourses();
    }, []);
    
    useEffect(() => {
        if (selectedCourse) {
            fetchAnalytics();
            fetchDetailedAttendance();
        }
    }, [selectedCourse, activeAnalytic]);
    
    const fetchCourses = async () => {
        try {
            const response = await api.getCourses();
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            if (activeAnalytic === 'grades') {
                const response = await api.getCourseGradeAnalytics(selectedCourse);
                setGradeAnalytics(response.data);
            } else if (activeAnalytic === 'attendance') {
                const response = await api.getCourseAttendanceAnalytics(selectedCourse);
                setAttendanceAnalytics(response.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchDetailedAttendance = async () => {
        try {
            const response = await api.getTeacherAttendance(selectedCourse);
            setDetailedAttendance(response.data);
        } catch (error) {
            console.error('Error fetching detailed attendance:', error);
        }
    };
    
    const getGradeColor = (percentage) => {
        if (percentage >= 90) return '#1b5e20';
        if (percentage >= 80) return '#2e7d32';
        if (percentage >= 75) return '#43a047';
        if (percentage >= 70) return '#7cb342';
        if (percentage >= 65) return '#9ccc65';
        if (percentage >= 60) return '#ffc107';
        if (percentage >= 55) return '#ff9800';
        if (percentage >= 50) return '#ff7043';
        return '#f44336';
    };
    
    const getLetterGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 75) return 'A-';
        if (percentage >= 70) return 'B+';
        if (percentage >= 65) return 'B';
        if (percentage >= 60) return 'B-';
        if (percentage >= 55) return 'C+';
        if (percentage >= 50) return 'C';
        if (percentage >= 45) return 'C-';
        if (percentage >= 40) return 'D+';
        if (percentage >= 35) return 'D';
        return 'E';
    };
    
    const getAttendanceColor = (percentage) => {
        if (percentage >= 80) return '#4caf50';
        if (percentage >= 70) return '#8bc34a';
        if (percentage >= 60) return '#ffc107';
        if (percentage >= 50) return '#ff9800';
        return '#f44336';
    };
    
    // Download attendance as CSV
    const downloadAttendanceCSV = () => {
        if (!attendanceAnalytics || !attendanceAnalytics.student_summary) return;
        
        const headers = ['Registration No.', 'Student Name', 'Present', 'Absent', 'Late', 'Excused', 'Total Classes', 'Percentage', 'Letter Grade'];
        const rows = attendanceAnalytics.student_summary.map(student => [
            student.registration_number,
            student.student_name,
            student.present,
            student.absent,
            student.late,
            student.excused || 0,
            student.total_possible,
            `${student.percentage}%`,
            getLetterGrade(student.percentage)
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${attendanceAnalytics.class_summary.course_code}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // Download detailed attendance as CSV
    const downloadDetailedAttendanceCSV = () => {
        if (!detailedAttendance || detailedAttendance.length === 0) return;
        
        const headers = ['Student Name', 'Date', 'Time Slot', 'Status', 'Marked At', 'Remarks'];
        const rows = detailedAttendance.flatMap(attendance => {
            if (attendance.attendances) {
                return attendance.attendances.map(a => [
                    a.student_name,
                    a.date,
                    a.time_slot,
                    a.status,
                    new Date(a.marked_at).toLocaleString(),
                    a.remarks || ''
                ]);
            }
            return [];
        });
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detailed_attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // Download grade analytics as CSV
    const downloadGradesCSV = () => {
        if (!gradeAnalytics) return;
        
        const headers = ['Assignment', 'Submissions', 'Graded', 'Average Grade (%)', 'Highest Grade', 'Lowest Grade'];
        const rows = gradeAnalytics.assignments.map(assignment => [
            assignment.title,
            assignment.submissions_count,
            assignment.graded_count,
            assignment.average_grade,
            assignment.highest_grade,
            assignment.lowest_grade
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grades_${gradeAnalytics.course_code}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    // Print analytics
    const printAnalytics = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Analytics Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #667eea; color: white; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .stat-box { display: inline-block; margin: 10px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Analytics Report</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <p>Course: ${selectedCourse ? courses.find(c => c.id == selectedCourse)?.name : 'All Courses'}</p>
                    </div>
                    ${document.querySelector('.analysis-content')?.innerHTML || ''}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };
    
    if (loading) return <div className="analysis-loading">Loading analytics...</div>;
    
    return (
        <div className="analysis-container">
            <div className="analysis-header">
                <h2 className="analysis-title">📊 Performance Analytics</h2>
                <p className="analysis-subtitle">Comprehensive insights into student performance and engagement</p>
            </div>
            
            <div className="analysis-course-selector">
                <select 
                    value={selectedCourse || ''} 
                    onChange={(e) => setSelectedCourse(e.target.value || null)}
                    className="analysis-course-select"
                >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {selectedCourse && (
                <>
                    <div className="analysis-tabs">
                        <button 
                            className={`analysis-tab ${activeAnalytic === 'grades' ? 'active' : ''}`}
                            onClick={() => setActiveAnalytic('grades')}
                        >
                            📊 Grade Analytics
                        </button>
                        <button 
                            className={`analysis-tab ${activeAnalytic === 'attendance' ? 'active' : ''}`}
                            onClick={() => setActiveAnalytic('attendance')}
                        >
                            📋 Attendance Analytics
                        </button>
                    </div>
                    
                    <div className="analysis-content">
                        {activeAnalytic === 'grades' && gradeAnalytics && (
                            <div className="analysis-grade-section">
                                <div className="analysis-section-header">
                                    <div>
                                        <h3 className="analysis-section-title">{gradeAnalytics.course_name}</h3>
                                        <p className="analysis-section-code">{gradeAnalytics.course_code}</p>
                                    </div>
                                    <div className="analysis-download-buttons">
                                        <button className="analysis-download-csv" onClick={downloadGradesCSV}>
                                            📊 Download CSV
                                        </button>
                                        <button className="analysis-print" onClick={printAnalytics}>
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="analysis-stats-grid">
                                    <div className="analysis-stat-card">
                                        <div className="analysis-stat-value">{gradeAnalytics.total_assignments}</div>
                                        <div className="analysis-stat-label">Total Assignments</div>
                                    </div>
                                    <div className="analysis-stat-card">
                                        <div className="analysis-stat-value">{gradeAnalytics.overall_average}%</div>
                                        <div className="analysis-stat-label">Overall Average</div>
                                        <div className="analysis-stat-grade">{getLetterGrade(gradeAnalytics.overall_average)}</div>
                                    </div>
                                </div>
                                
                                <div className="analysis-assignments">
                                    {gradeAnalytics.assignments?.map(assignment => {
                                        const avgGrade = assignment.average_grade;
                                        const gradeLetter = getLetterGrade(avgGrade);
                                        const gradeColor = getGradeColor(avgGrade);
                                        const circumference = 283;
                                        const strokeDashoffset = circumference - (avgGrade / 100) * circumference;
                                        
                                        return (
                                            <div key={assignment.assignment_id} className="analysis-assignment-card">
                                                <div className="analysis-assignment-header">
                                                    <div className="analysis-assignment-info">
                                                        <h4 className="analysis-assignment-title">{assignment.title}</h4>
                                                        <div className="analysis-assignment-stats">
                                                            <span className="analysis-assignment-stat">📝 Submissions: {assignment.submissions_count}</span>
                                                            <span className="analysis-assignment-stat">✅ Graded: {assignment.graded_count}</span>
                                                            <span className="analysis-assignment-stat">⭐ Average: {assignment.average_grade}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="analysis-grade-circle">
                                                        <svg className="analysis-circle-svg" viewBox="0 0 100 100">
                                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                                                            <circle 
                                                                cx="50" cy="50" r="45" fill="none" 
                                                                stroke={gradeColor} 
                                                                strokeWidth="8"
                                                                strokeDasharray={circumference}
                                                                strokeDashoffset={strokeDashoffset}
                                                                strokeLinecap="round"
                                                                transform="rotate(-90 50 50)"
                                                                className="analysis-circle-progress"
                                                            />
                                                        </svg>
                                                        <div className="analysis-circle-content">
                                                            <span className="analysis-circle-percentage">{avgGrade}%</span>
                                                            <span className="analysis-circle-grade" style={{background: gradeColor}}>{gradeLetter}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {activeAnalytic === 'attendance' && attendanceAnalytics && (
                            <div className="analysis-attendance-section">
                                <div className="analysis-section-header">
                                    <h3 className="analysis-section-title">Attendance Summary</h3>
                                    <div className="analysis-download-buttons">
                                        <button className="analysis-download-csv" onClick={downloadAttendanceCSV}>
                                            📊 Download Summary CSV
                                        </button>
                                        <button className="analysis-download-csv" onClick={downloadDetailedAttendanceCSV}>
                                            📋 Download Detailed CSV
                                        </button>
                                        <button className="analysis-print" onClick={printAnalytics}>
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="analysis-stats-grid">
                                    <div className="analysis-stat-card">
                                        <div className="analysis-stat-value">{attendanceAnalytics.class_summary?.total_sessions}</div>
                                        <div className="analysis-stat-label">Total Classes</div>
                                    </div>
                                    <div className="analysis-stat-card">
                                        <div className="analysis-stat-value">{attendanceAnalytics.class_summary?.average_attendance}%</div>
                                        <div className="analysis-stat-label">Average Attendance</div>
                                        <div className="analysis-stat-grade">{getLetterGrade(attendanceAnalytics.class_summary?.average_attendance)}</div>
                                    </div>
                                </div>
                                
                                {isTeacher && (
                                    <>
                                        <div className="analysis-section-header-small">
                                            <h4>Student Attendance Summary</h4>
                                            <button 
                                                className="analysis-toggle-detail"
                                                onClick={() => setShowDetailedAttendance(!showDetailedAttendance)}
                                            >
                                                {showDetailedAttendance ? 'Hide Detailed View' : 'Show Detailed View'}
                                            </button>
                                        </div>
                                        
                                        <div className="analysis-table-wrapper">
                                            <table className="analysis-table">
                                                <thead>
                                                    <tr>
                                                        <th>Registration No.</th>
                                                        <th>Student Name</th>
                                                        <th>Present</th>
                                                        <th>Absent</th>
                                                        <th>Late</th>
                                                        <th>Excused</th>
                                                        <th>Total</th>
                                                        <th>Percentage</th>
                                                        <th>Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendanceAnalytics.student_summary?.map(student => (
                                                        <tr key={student.student_id}>
                                                            <td>{student.registration_number}</td>
                                                            <td>{student.student_name}</td>
                                                            <td>{student.present}</td>
                                                            <td>{student.absent}</td>
                                                            <td>{student.late}</td>
                                                            <td>{student.excused || 0}</td>
                                                            <td>{student.total_possible}</td>
                                                            <td>
                                                                <div className="analysis-percentage-cell">
                                                                    <div 
                                                                        className="analysis-percentage-bar"
                                                                        style={{width: `${student.percentage}%`, background: getAttendanceColor(student.percentage)}}
                                                                    ></div>
                                                                    <span className="analysis-percentage-text">{student.percentage}%</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="analysis-grade-badge" style={{background: getAttendanceColor(student.percentage)}}>
                                                                    {getLetterGrade(student.percentage)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {showDetailedAttendance && (
                                            <div className="analysis-detailed-attendance">
                                                <h4>Detailed Attendance Records</h4>
                                                <div className="analysis-session-grid">
                                                    {attendanceAnalytics.session_summary?.map(session => (
                                                        <div key={session.date} className="analysis-session-card">
                                                            <div className="analysis-session-header">
                                                                <span className="analysis-session-date">{new Date(session.date).toLocaleDateString()}</span>
                                                                <span className="analysis-session-time">{session.time_slot}</span>
                                                                <span className={`analysis-session-status ${session.is_active ? 'active' : 'closed'}`}>
                                                                    {session.is_active ? '🟢 Active' : '🔴 Closed'}
                                                                </span>
                                                            </div>
                                                            <div className="analysis-session-stats">
                                                                <div className="analysis-session-stat">Present: <strong>{session.present}</strong></div>
                                                                <div className="analysis-session-stat">Absent: <strong>{session.absent}</strong></div>
                                                                <div className="analysis-session-stat">Late: <strong>{session.late}</strong></div>
                                                                <div className="analysis-session-stat">Rate: <strong>{session.attendance_rate}%</strong></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {isStudent && (
                                    <div className="analysis-personal-stats">
                                        <h4>Your Attendance Summary</h4>
                                        {attendanceAnalytics.student_summary
                                            ?.filter(s => s.student_id === user?.id)
                                            .map(student => {
                                                const circumference = 283;
                                                const strokeDashoffset = circumference - (student.percentage / 100) * circumference;
                                                const attendanceColor = getAttendanceColor(student.percentage);
                                                
                                                return (
                                                    <div key={student.student_id} className="analysis-personal-card">
                                                        <div className="analysis-personal-circle">
                                                            <svg className="analysis-circle-svg" viewBox="0 0 100 100">
                                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                                                                <circle 
                                                                    cx="50" cy="50" r="45" fill="none" 
                                                                    stroke={attendanceColor} 
                                                                    strokeWidth="8"
                                                                    strokeDasharray={circumference}
                                                                    strokeDashoffset={strokeDashoffset}
                                                                    strokeLinecap="round"
                                                                    transform="rotate(-90 50 50)"
                                                                    className="analysis-circle-progress"
                                                                />
                                                            </svg>
                                                            <div className="analysis-circle-content">
                                                                <span className="analysis-circle-percentage">{student.percentage}%</span>
                                                                <span className="analysis-circle-grade" style={{background: attendanceColor}}>
                                                                    {getLetterGrade(student.percentage)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="analysis-personal-details">
                                                            <div className="analysis-personal-item">
                                                                <span className="analysis-personal-label">Present:</span>
                                                                <span className="analysis-personal-value">{student.present}</span>
                                                            </div>
                                                            <div className="analysis-personal-item">
                                                                <span className="analysis-personal-label">Absent:</span>
                                                                <span className="analysis-personal-value">{student.absent}</span>
                                                            </div>
                                                            <div className="analysis-personal-item">
                                                                <span className="analysis-personal-label">Late:</span>
                                                                <span className="analysis-personal-value">{student.late}</span>
                                                            </div>
                                                            <div className="analysis-personal-item">
                                                                <span className="analysis-personal-label">Excused:</span>
                                                                <span className="analysis-personal-value">{student.excused || 0}</span>
                                                            </div>
                                                            <div className="analysis-personal-item">
                                                                <span className="analysis-personal-label">Total Classes:</span>
                                                                <span className="analysis-personal-value">{student.total_possible}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                                
                                {isTeacher && (
                                    <div className="analysis-daily-trend">
                                        <h4>Daily Attendance Trend</h4>
                                        <div className="analysis-trend-chart">
                                            {attendanceAnalytics.session_summary?.map(session => (
                                                <div key={session.date} className="analysis-trend-bar">
                                                    <div 
                                                        className="analysis-trend-bar-fill" 
                                                        style={{height: `${session.attendance_rate * 2}px`, background: getAttendanceColor(session.attendance_rate)}}
                                                    ></div>
                                                    <div className="analysis-trend-label">{new Date(session.date).toLocaleDateString()}</div>
                                                    <div className="analysis-trend-value">{session.attendance_rate}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;