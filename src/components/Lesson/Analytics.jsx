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
    
    const profileType = getProfileType();
    
    useEffect(() => {
        fetchCourses();
    }, []);
    
    useEffect(() => {
        if (selectedCourse) {
            fetchAnalytics();
            if (activeAnalytic === 'attendance' && isTeacher) {
                fetchDetailedAttendance();
            }
        }
    }, [selectedCourse, activeAnalytic]);
    
    const fetchCourses = async () => {
        setLoading(true);
        try {
            if (isStudent) {
                const enrollmentsRes = await api.getEnrollments();
                const enrolledData = enrollmentsRes.data;
                const coursesList = enrolledData.map(enrollment => ({
                    id: enrollment.course,
                    code: enrollment.course_code,
                    name: enrollment.course_name,
                    enrolled_at: enrollment.enrolled_at
                }));
                setCourses(coursesList);
                if (coursesList.length > 0 && !selectedCourse) {
                    setSelectedCourse(coursesList[0].id);
                }
            } else if (isTeacher) {
                const myCoursesRes = await api.getMyCourses();
                setCourses(myCoursesRes.data);
                if (myCoursesRes.data.length > 0 && !selectedCourse) {
                    setSelectedCourse(myCoursesRes.data[0].id);
                }
            } else {
                const coursesRes = await api.getCourses();
                setCourses(coursesRes.data);
            }
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
    
    const downloadAttendanceCSV = () => {
        if (!isTeacher) return;
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
    
    const downloadDetailedAttendanceCSV = () => {
        if (!isTeacher) return;
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
    
    const downloadGradesCSV = () => {
        if (!isTeacher) return;
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
    
    if (!loading && courses.length === 0) {
        return (
            <div className="analysis-container">
                <div className="analysis-header">
                    <h2 className="analysis-title">📊 Performance Analytics</h2>
                    <p className="analysis-subtitle">Comprehensive insights into student performance and engagement</p>
                </div>
                <div className="analysis-no-courses">
                    <div className="analysis-no-courses-icon">📚</div>
                    <h3>No Courses Available</h3>
                    <p>
                        {isStudent 
                            ? "You are not enrolled in any courses yet. Please enroll in courses to view analytics."
                            : isTeacher
                            ? "You are not assigned to any courses yet. Contact an administrator to get course assignments."
                            : "No courses available in the system."}
                    </p>
                    {isStudent && (
                        <button 
                            className="analysis-enroll-btn"
                            onClick={() => window.location.href = '/student/enrollment'}
                        >
                            Enroll in Courses
                        </button>
                    )}
                </div>
            </div>
        );
    }
    
    if (loading) return <div className="analysis-loading">Loading analytics...</div>;
    
    return (
        <div className="analysis-container">
            <div className="analysis-header">
                <h2 className="analysis-title">📊 Performance Analytics</h2>
                <p className="analysis-subtitle">
                    {isStudent 
                        ? "Track your personal performance and attendance"
                        : isTeacher
                        ? "Monitor class performance and student engagement"
                        : "Comprehensive insights into student performance and engagement"}
                </p>
            </div>
            
            <div className="analysis-course-selector">
                <label className="analysis-filter-label">Select Course:</label>
                <select 
                    value={selectedCourse || ''} 
                    onChange={(e) => setSelectedCourse(e.target.value || null)}
                    className="analysis-course-select"
                >
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
                {isStudent && courses.length > 0 && (
                    <div className="analysis-enrolled-info">
                        📚 Enrolled in {courses.length} course{courses.length !== 1 ? 's' : ''}
                    </div>
                )}
                {isTeacher && courses.length > 0 && (
                    <div className="analysis-teaching-info">
                        👨‍🏫 Teaching {courses.length} course{courses.length !== 1 ? 's' : ''}
                    </div>
                )}
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
                        {/* STUDENT GRADE ANALYTICS */}
                        {activeAnalytic === 'grades' && gradeAnalytics && isStudent && (
                            <div className="analysis-grade-section">
                                <div className="analysis-section-header">
                                    <div>
                                        <h3 className="analysis-section-title">{gradeAnalytics.course_name}</h3>
                                        <p className="analysis-section-code">{gradeAnalytics.course_code}</p>
                                    </div>
                                </div>
                                
                                <div className="analysis-personal-grade-summary">
                                    <h4>Your Performance Summary</h4>
                                    <div className="analysis-stats-grid">
                                        <div className="analysis-stat-card">
                                            <div className="analysis-stat-value">{gradeAnalytics.your_average || gradeAnalytics.student_average}%</div>
                                            <div className="analysis-stat-label">Your Average Grade</div>
                                            <div className="analysis-stat-grade">{getLetterGrade(gradeAnalytics.your_average || gradeAnalytics.student_average)}</div>
                                        </div>
                                        <div className="analysis-stat-card">
                                            <div className="analysis-stat-value">{gradeAnalytics.class_average || gradeAnalytics.overall_average}%</div>
                                            <div className="analysis-stat-label">Class Average</div>
                                            <div className="analysis-stat-grade">{getLetterGrade(gradeAnalytics.class_average || gradeAnalytics.overall_average)}</div>
                                        </div>
                                        <div className="analysis-stat-card">
                                            <div className="analysis-stat-value">{gradeAnalytics.your_rank || 'N/A'}</div>
                                            <div className="analysis-stat-label">Your Rank</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="analysis-assignments-table-section">
                                    <h4>Your Assignment Grades</h4>
                                    <div className="analysis-table-wrapper">
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>Assignment Title</th>
                                                    <th>Due Date</th>
                                                    <th>Submitted</th>
                                                    <th>Grade (%)</th>
                                                    <th>Letter Grade</th>
                                                    <th>Feedback</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradeAnalytics.your_assignments?.map(assignment => {
                                                    const dueDate = new Date(assignment.due_date);
                                                    const formattedDueDate = dueDate.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    });
                                                    
                                                    return (
                                                        <tr key={assignment.id}>
                                                            <td><strong>{assignment.title}</strong></td>
                                                            <td>{formattedDueDate}</td>
                                                            <td>
                                                                <span className={`analysis-submission-status ${assignment.submitted ? 'submitted' : 'not-submitted'}`}>
                                                                    {assignment.submitted ? '✅ Yes' : '❌ No'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {assignment.grade ? (
                                                                    <div className="analysis-grade-cell">
                                                                        <div 
                                                                            className="analysis-grade-bar"
                                                                            style={{width: `${assignment.grade}%`, background: getGradeColor(assignment.grade)}}
                                                                        ></div>
                                                                        <span>{assignment.grade}%</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="analysis-not-graded">Not graded yet</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {assignment.grade && (
                                                                    <span className="analysis-grade-badge" style={{background: getGradeColor(assignment.grade)}}>
                                                                        {getLetterGrade(assignment.grade)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="analysis-feedback-cell">
                                                                {assignment.feedback || '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* TEACHER GRADE ANALYTICS */}
                        {activeAnalytic === 'grades' && gradeAnalytics && isTeacher && (
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
                                
                                <div className="analysis-assignments-table-section">
                                    <h4>Assignments Summary</h4>
                                    <div className="analysis-table-wrapper">
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>Assignment</th>
                                                    <th>Submissions</th>
                                                    <th>Graded</th>
                                                    <th>Average Grade</th>
                                                    <th>Highest</th>
                                                    <th>Lowest</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradeAnalytics.assignments?.map(assignment => (
                                                    <tr key={assignment.assignment_id}>
                                                        <td><strong>{assignment.title}</strong></td>
                                                        <td>{assignment.submissions_count}</td>
                                                        <td>{assignment.graded_count}</td>
                                                        <td>
                                                            <div className="analysis-grade-cell">
                                                                <div 
                                                                    className="analysis-grade-bar"
                                                                    style={{width: `${assignment.average_grade}%`, background: getGradeColor(assignment.average_grade)}}
                                                                ></div>
                                                                <span>{assignment.average_grade}%</span>
                                                            </div>
                                                        </td>
                                                        <td>{assignment.highest_grade}%</td>
                                                        <td>{assignment.lowest_grade}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <div className="analysis-student-grades-table">
                                    <h4>Student Grades Overview</h4>
                                    <div className="analysis-table-wrapper">
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>Registration No.</th>
                                                    <th>Student Name</th>
                                                    <th>Average Grade</th>
                                                    <th>Letter Grade</th>
                                                    <th>Assignments Completed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradeAnalytics.student_grades?.map(student => (
                                                    <tr key={student.student_id}>
                                                        <td>{student.registration_number}</td>
                                                        <td>{student.student_name}</td>
                                                        <td>
                                                            <div className="analysis-grade-cell">
                                                                <div 
                                                                    className="analysis-grade-bar"
                                                                    style={{width: `${student.average_grade}%`, background: getGradeColor(student.average_grade)}}
                                                                ></div>
                                                                <span>{student.average_grade}%</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="analysis-grade-badge" style={{background: getGradeColor(student.average_grade)}}>
                                                                {getLetterGrade(student.average_grade)}
                                                            </span>
                                                        </td>
                                                        <td>{student.completed_assignments || 0}/{gradeAnalytics.total_assignments}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* STUDENT ATTENDANCE ANALYTICS - FIXED: Using session_summary instead of student_attendance_records */}
                        {activeAnalytic === 'attendance' && attendanceAnalytics && isStudent && (
                            <div className="analysis-attendance-section">
                                <div className="analysis-section-header">
                                    <h3 className="analysis-section-title">Your Attendance Summary</h3>
                                </div>
                                
                                {attendanceAnalytics.student_summary
                                    ?.filter(s => s.student_id === user?.id)
                                    .map(student => (
                                        <div key={student.student_id}>
                                            <div className="analysis-stats-grid">
                                                <div className="analysis-stat-card">
                                                    <div className="analysis-stat-value">{student.present}</div>
                                                    <div className="analysis-stat-label">Present</div>
                                                </div>
                                                <div className="analysis-stat-card">
                                                    <div className="analysis-stat-value">{student.absent}</div>
                                                    <div className="analysis-stat-label">Absent</div>
                                                </div>
                                                <div className="analysis-stat-card">
                                                    <div className="analysis-stat-value">{student.late}</div>
                                                    <div className="analysis-stat-label">Late</div>
                                                </div>
                                                <div className="analysis-stat-card">
                                                    <div className="analysis-stat-value">{student.excused || 0}</div>
                                                    <div className="analysis-stat-label">Excused</div>
                                                </div>
                                            </div>
                                            
                                            <div className="analysis-personal-card">
                                                <div className="analysis-personal-circle">
                                                    <svg className="analysis-circle-svg" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                                                        <circle 
                                                            cx="50" cy="50" r="45" fill="none" 
                                                            stroke={getAttendanceColor(student.percentage)} 
                                                            strokeWidth="8"
                                                            strokeDasharray={283}
                                                            strokeDashoffset={283 - (student.percentage / 100) * 283}
                                                            strokeLinecap="round"
                                                            transform="rotate(-90 50 50)"
                                                            className="analysis-circle-progress"
                                                        />
                                                    </svg>
                                                    <div className="analysis-circle-content">
                                                        <span className="analysis-circle-percentage">{student.percentage}%</span>
                                                        <span className="analysis-circle-grade" style={{background: getAttendanceColor(student.percentage)}}>
                                                            {getLetterGrade(student.percentage)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="analysis-personal-details">
                                                    <div className="analysis-personal-item">
                                                        <span className="analysis-personal-label">Total Classes:</span>
                                                        <span className="analysis-personal-value">{student.total_possible}</span>
                                                    </div>
                                                    <div className="analysis-personal-item">
                                                        <span className="analysis-personal-label">Attendance Rate:</span>
                                                        <span className="analysis-personal-value">{student.percentage}%</span>
                                                    </div>
                                                    <div className="analysis-personal-item">
                                                        <span className="analysis-personal-label">Grade:</span>
                                                        <span className="analysis-personal-value">{getLetterGrade(student.percentage)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                
                                {/* FIXED: Using session_summary from backend instead of student_attendance_records */}
                                <div className="analysis-detailed-attendance-table">
                                    <h4>Class Attendance Sessions</h4>
                                    <div className="analysis-table-wrapper">
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Time Slot</th>
                                                    <th>Total Students</th>
                                                    <th>Present</th>
                                                    <th>Absent</th>
                                                    <th>Late</th>
                                                    <th>Attendance Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceAnalytics.session_summary?.map((session, index) => {
                                                    const sessionDate = new Date(session.date);
                                                    const formattedDate = sessionDate.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    });
                                                    
                                                    return (
                                                        <tr key={index}>
                                                            <td>{formattedDate}</td>
                                                            <td>{session.time_slot}</td>
                                                            <td>{session.total_students || session.present + session.absent + session.late}</td>
                                                            <td>{session.present}</td>
                                                            <td>{session.absent}</td>
                                                            <td>{session.late}</td>
                                                            <td>
                                                                <div className="analysis-percentage-cell">
                                                                    <div 
                                                                        className="analysis-percentage-bar"
                                                                        style={{width: `${session.attendance_rate}%`, background: getAttendanceColor(session.attendance_rate)}}
                                                                    ></div>
                                                                    <span className="analysis-percentage-text">{session.attendance_rate}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* TEACHER ATTENDANCE ANALYTICS */}
                        {activeAnalytic === 'attendance' && attendanceAnalytics && isTeacher && (
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
                                
                                <div className="analysis-student-attendance-table">
                                    <h4>Student Attendance Summary</h4>
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
                                                        
                                                        <tr>
                                                            <div className="analysis-percentage-cell">
                                                                <div 
                                                                    className="analysis-percentage-bar"
                                                                    style={{width: `${student.percentage}%`, background: getAttendanceColor(student.percentage)}}
                                                                ></div>
                                                                <span className="analysis-percentage-text">{student.percentage}%</span>
                                                            </div>
                                                        </tr>
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
                                </div>
                                
                                <div className="analysis-detailed-attendance-table">
                                    <h4>Session-wise Attendance</h4>
                                    <div className="analysis-table-wrapper">
                                        <table className="analysis-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Time Slot</th>
                                                    <th>Total Students</th>
                                                    <th>Present</th>
                                                    <th>Absent</th>
                                                    <th>Late</th>
                                                    <th>Rate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceAnalytics.session_summary?.map((session, index) => {
                                                    const sessionDate = new Date(session.date);
                                                    const formattedDate = sessionDate.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    });
                                                    
                                                    return (
                                                        <tr key={index}>
                                                            <td>{formattedDate}</td>
                                                            <td>{session.time_slot}</td>
                                                            <td>{session.total_students || session.present + session.absent + session.late}</td>
                                                            <td>{session.present}</td>
                                                            <td>{session.absent}</td>
                                                            <td>{session.late}</td>
                                                            <td>
                                                                <div className="analysis-percentage-cell">
                                                                    <div 
                                                                        className="analysis-percentage-bar"
                                                                        style={{width: `${session.attendance_rate}%`, background: getAttendanceColor(session.attendance_rate)}}
                                                                    ></div>
                                                                    <span className="analysis-percentage-text">{session.attendance_rate}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
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
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;