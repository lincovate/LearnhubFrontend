import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './GradingView.css';

const GradingView = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { isTeacher } = useAuth();
    
    const [assignment, setAssignment] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState(null);
    const [dateFilter, setDateFilter] = useState('');
    const [weekFilter, setWeekFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [gradingData, setGradingData] = useState({});
    const [message, setMessage] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [activeTab, setActiveTab] = useState('current');
    const [downloadingId, setDownloadingId] = useState(null); // Track which submission is downloading

    // Helper function to get week number from date
    const getWeekNumber = (date) => {
        const d = new Date(date);
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };

    // Get week range display
    const getWeekRange = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const start = new Date(d);
        start.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    const getFileType = (filename) => {
        if (!filename) return 'unknown';
        const ext = filename.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const pdfTypes = ['pdf'];
        if (imageTypes.includes(ext)) return 'image';
        if (pdfTypes.includes(ext)) return 'pdf';
        return 'document';
    };

    const getFileIcon = (fileType) => {
        switch(fileType) {
            case 'image': return '🖼️';
            case 'pdf': return '📕';
            default: return '📎';
        }
    };

    const getFileBadgeColor = (fileType) => {
        switch(fileType) {
            case 'image': return '#9c27b0';
            case 'pdf': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const handleDownload = async (attachmentUrl, submissionId, filename) => {
        if (!attachmentUrl) return;
        
        setDownloadingId(submissionId);
        try {
            if (!filename) {
                const urlParts = attachmentUrl.split('/');
                filename = urlParts[urlParts.length - 1];
                filename = filename.split('?')[0];
            }
            
            const success = await api.triggerDownload(attachmentUrl, filename);
            
            if (!success) {
                alert('Download failed. Please try again.');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading file. Please check your connection.');
        } finally {
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (assignmentId && activeTab === 'current') {
            fetchAssignmentAndSubmissions();
        }
    }, [assignmentId, activeTab]);

    useEffect(() => {
        if (activeTab === 'all') {
            fetchAllSubmissions();
        }
    }, [selectedCourse, selectedAssignmentFilter, dateFilter, weekFilter, activeTab]);

    const fetchInitialData = async () => {
        try {
            const [coursesRes, assignmentsRes] = await Promise.all([
                api.getCourses(),
                api.getAssignments()
            ]);
            setCourses(coursesRes.data);
            setAssignments(assignmentsRes.data);
            
            if (assignmentId) {
                const currentAssignment = assignmentsRes.data.find(a => a.id === parseInt(assignmentId));
                setAssignment(currentAssignment);
                await fetchAssignmentAndSubmissions();
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignmentAndSubmissions = async () => {
        if (!assignmentId) return;
        
        try {
            const submissionsRes = await api.getAssignmentSubmissions(assignmentId);
            setSubmissions(submissionsRes.data);
            
            const initialGrading = {};
            submissionsRes.data.forEach(sub => {
                initialGrading[sub.id] = {
                    marks: sub.grade_info?.marks_obtained || '',
                    feedback: sub.grade_info?.feedback || ''
                };
            });
            setGradingData(initialGrading);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            showMessage('error', 'Failed to load submissions');
        }
    };

    const fetchAllSubmissions = async () => {
        try {
            const submissionsRes = await api.getSubmissions();
            let filteredSubmissions = submissionsRes.data;
            
            // Filter by course
            if (selectedCourse) {
                const courseAssignments = assignments.filter(a => a.course === parseInt(selectedCourse));
                const assignmentIds = courseAssignments.map(a => a.id);
                filteredSubmissions = filteredSubmissions.filter(s => assignmentIds.includes(s.assignment));
            }
            
            // Filter by assignment
            if (selectedAssignmentFilter) {
                filteredSubmissions = filteredSubmissions.filter(s => s.assignment === parseInt(selectedAssignmentFilter));
            }
            
            // Filter by specific date
            if (dateFilter) {
                const filterDate = new Date(dateFilter).toDateString();
                filteredSubmissions = filteredSubmissions.filter(s => 
                    new Date(s.submitted_at).toDateString() === filterDate
                );
            }
            
            // Filter by week
            if (weekFilter) {
                const weekNumber = parseInt(weekFilter);
                filteredSubmissions = filteredSubmissions.filter(s => 
                    getWeekNumber(s.submitted_at) === weekNumber
                );
            }
            
            // Sort by submitted date (newest first)
            filteredSubmissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
            
            setAllSubmissions(filteredSubmissions);
            
            const initialGrading = {};
            filteredSubmissions.forEach(sub => {
                initialGrading[sub.id] = {
                    marks: sub.grade_info?.marks_obtained || '',
                    feedback: sub.grade_info?.feedback || ''
                };
            });
            setGradingData(initialGrading);
        } catch (error) {
            console.error('Error fetching all submissions:', error);
            showMessage('error', 'Failed to load submissions');
        }
    };

    const clearFilters = () => {
        setSelectedCourse(null);
        setSelectedAssignmentFilter(null);
        setDateFilter('');
        setWeekFilter('');
        fetchAllSubmissions();
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleGradeChange = (submissionId, field, value) => {
        setGradingData(prev => ({
            ...prev,
            [submissionId]: { ...prev[submissionId], [field]: value }
        }));
    };

    const handleSubmitGrade = async (submissionId) => {
        const data = gradingData[submissionId];
        if (!data.marks) {
            showMessage('error', 'Please enter marks');
            return;
        }
        const marks = parseFloat(data.marks);
        if (marks < 0 || marks > 100) {
            showMessage('error', 'Marks must be between 0 and 100');
            return;
        }
        
        try {
            await api.gradeSubmission(submissionId, {
                marks_obtained: marks,
                feedback: data.feedback || ''
            });
            showMessage('success', 'Grade submitted successfully!');
            
            if (activeTab === 'current' && assignmentId) {
                await fetchAssignmentAndSubmissions();
            } else {
                await fetchAllSubmissions();
            }
        } catch (error) {
            showMessage('error', 'Failed to submit grade');
        }
    };

    const getGradeColor = (marks) => {
        if (marks >= 80) return '#4caf50';
        if (marks >= 70) return '#8bc34a';
        if (marks >= 60) return '#ffc107';
        if (marks >= 50) return '#ff9800';
        return '#f44336';
    };

    const getAssignmentTitle = (assignmentId) => {
        const found = assignments.find(a => a.id === assignmentId);
        return found ? found.title : 'Unknown Assignment';
    };

    const getCourseName = (assignmentId) => {
        const found = assignments.find(a => a.id === assignmentId);
        const course = courses.find(c => c.id === found?.course);
        return course ? `${course.code} - ${course.name}` : 'Unknown Course';
    };

    const getSubmissionStatus = (submission) => {
        if (submission.grade_info) return 'graded';
        if (submission.is_late) return 'late';
        return 'submitted';
    };

    if (loading) {
        return (
            <div className="grading-view-loading-container">
                <div className="grading-view-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="grading-view-container">
            <div className="grading-view-header">
                <button className="grading-view-back-btn" onClick={() => navigate('/teacher/dashboard')}>← Back to Dashboard</button>
                <div className="grading-view-header-center">
                    <h2>📝 Grade Submissions</h2>
                    {activeTab === 'current' && assignment && <p className="grading-view-assignment-info">{assignment.title} - {assignment.course_code} ({assignment.total_marks} marks)</p>}
                </div>
                <div className="grading-view-header-right"></div>
            </div>

            <div className="grading-view-tabs">
                <button className={`grading-view-tab-btn ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>
                    📋 Current Assignment
                </button>
                <button className={`grading-view-tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    📚 All Submissions
                </button>
            </div>

            {message && (
                <div className={`grading-view-message-banner grading-view-message-${message.type}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}

            {activeTab === 'current' ? (
                <>
                    {submissions.length === 0 ? (
                        <div className="grading-view-no-submissions">No submissions yet for this assignment.</div>
                    ) : (
                        <>
                            <div className="grading-view-submissions-stats">
                                <div className="grading-view-stat-card"><div className="grading-view-stat-value">{submissions.length}</div><div className="grading-view-stat-label">Total</div></div>
                                <div className="grading-view-stat-card"><div className="grading-view-stat-value">{submissions.filter(s => s.grade_info).length}</div><div className="grading-view-stat-label">Graded</div></div>
                                <div className="grading-view-stat-card"><div className="grading-view-stat-value">{submissions.filter(s => !s.grade_info).length}</div><div className="grading-view-stat-label">Pending</div></div>
                            </div>
                            <div className="grading-view-submissions-grid">{renderSubmissions(submissions)}</div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <div className="grading-view-filters-section">
                        <div className="grading-view-filter-group">
                            <label>Filter by Course:</label>
                            <select value={selectedCourse || ''} onChange={(e) => setSelectedCourse(e.target.value || null)}>
                                <option value="">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="grading-view-filter-group">
                            <label>Filter by Assignment:</label>
                            <select value={selectedAssignmentFilter || ''} onChange={(e) => setSelectedAssignmentFilter(e.target.value || null)} disabled={!selectedCourse}>
                                <option value="">All Assignments</option>
                                {assignments.filter(a => !selectedCourse || a.course === parseInt(selectedCourse)).map(assignment => (
                                    <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grading-view-filter-group">
                            <label>Filter by Date:</label>
                            <input 
                                type="date" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="grading-view-date-input"
                            />
                        </div>

                        <div className="grading-view-filter-group">
                            <label>Filter by Week:</label>
                            <select value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)}>
                                <option value="">All Weeks</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 18}>Week {i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grading-view-filter-group grading-view-filter-actions">
                            <button className="grading-view-clear-filters-btn" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {allSubmissions.length === 0 ? (
                        <div className="grading-view-no-submissions">No submissions found.</div>
                    ) : (
                        <>
                            <div className="grading-view-submissions-stats">
                                <div className="grading-view-stat-card"><div className="grading-view-stat-value">{allSubmissions.length}</div><div className="grading-view-stat-label">Total Submissions</div></div>
                                <div className="grading-view-stat-card"><div className="grading-view-stat-value">{allSubmissions.filter(s => s.grade_info).length}</div><div className="grading-view-stat-label">Graded</div></div>
                                <div className="grading-view-stat-card"><div className="grading-view-stat-value">{allSubmissions.filter(s => !s.grade_info).length}</div><div className="grading-view-stat-label">Pending</div></div>
                            </div>
                            <div className="grading-view-submissions-grid">{renderSubmissions(allSubmissions, true)}</div>
                        </>
                    )}
                </>
            )}

            {previewFile && (
                <div className="grading-view-preview-modal-overlay" onClick={() => setPreviewFile(null)}>
                    <div className="grading-view-preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="grading-view-preview-header">
                            <h3>File Preview</h3>
                            <button className="grading-view-close-preview" onClick={() => setPreviewFile(null)}>×</button>
                        </div>
                        <div className="grading-view-preview-body">
                            {previewType === 'image' && <img src={previewFile} alt="Preview" className="grading-view-preview-image" />}
                            {previewType === 'pdf' && <iframe src={previewFile} title="PDF Preview" className="grading-view-preview-pdf" />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function renderSubmissions(submissionsList, showAssignmentInfo = false) {
        return submissionsList.map(sub => {
            const fileType = getFileType(sub.submission_file);
            const isGraded = !!sub.grade_info;
            const status = getSubmissionStatus(sub);
            const weekNumber = getWeekNumber(sub.submitted_at);
            const weekRange = getWeekRange(sub.submitted_at);
            
            return (
                <div key={sub.id} className={`grading-view-submission-card grading-view-submission-${status}`}>
                    <div className="grading-view-submission-header">
                        <div className="grading-view-student-info">
                            <div className="grading-view-student-avatar">{sub.student_full_name?.charAt(0) || 'S'}</div>
                            <div className="grading-view-student-details">
                                <h4>{sub.student_full_name || sub.student_name}</h4>
                                <span>{sub.student_name}</span>
                            </div>
                        </div>
                        <div className="grading-view-submission-status">
                            {showAssignmentInfo && (
                                <div className="grading-view-assignment-badge">{getAssignmentTitle(sub.assignment)}</div>
                            )}
                            <div className="grading-view-date-badge">
                                📅 Week {weekNumber}
                            </div>
                            {sub.is_late ? (
                                <span className="grading-view-late-badge">⚠️ Late</span>
                            ) : (
                                <span className="grading-view-on-time-badge">✓ On Time</span>
                            )}
                        </div>
                    </div>
                    <div className="grading-view-submission-body">
                        {showAssignmentInfo && (
                            <div className="grading-view-course-info">
                                <span className="grading-view-course-badge">📚 {getCourseName(sub.assignment)}</span>
                            </div>
                        )}
                        <div className="grading-view-submission-meta">
                            <div className="grading-view-meta-item">📅 Submitted: {new Date(sub.submitted_at).toLocaleString()}</div>
                            <div className="grading-view-meta-item">📊 Total Marks: {sub.assignment_total_marks || 100}</div>
                            <div className="grading-view-meta-item">🗓️ Week {weekNumber} ({weekRange})</div>
                        </div>
                        <div className="grading-view-submission-file-section">
                            <div className="grading-view-file-badge" style={{ background: getFileBadgeColor(fileType) }}>
                                {getFileIcon(fileType)} {fileType.toUpperCase()}
                            </div>
                            <div className="grading-view-file-info">
                                <span className="grading-view-file-name">{sub.submission_file.split('/').pop()}</span>
                                <div className="grading-view-file-actions">
                                    <button 
                                        onClick={() => handleDownload(sub.submission_file, sub.id)}
                                        className="grading-view-download-link"
                                        disabled={downloadingId === sub.id}
                                        style={{ background: 'none', border: 'none', cursor: downloadingId === sub.id ? 'not-allowed' : 'pointer' }}
                                    >
                                        📎 {downloadingId === sub.id ? 'Downloading...' : 'Download'}
                                    </button>
                                    {fileType === 'image' && (
                                        <button className="grading-view-preview-link" onClick={() => { setPreviewFile(sub.submission_file); setPreviewType('image'); }}>👁️ Preview</button>
                                    )}
                                    {fileType === 'pdf' && (
                                        <button className="grading-view-preview-link" onClick={() => { setPreviewFile(sub.submission_file); setPreviewType('pdf'); }}>📄 View PDF</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grading-view-grading-section">
                            <div className="grading-view-grade-input-group">
                                <label>Grade (0-100):</label>
                                <input 
                                    type="number" 
                                    className={`grading-view-grade-input ${isGraded ? 'grading-view-has-grade' : ''}`} 
                                    value={gradingData[sub.id]?.marks || ''} 
                                    onChange={(e) => handleGradeChange(sub.id, 'marks', e.target.value)} 
                                    min="0" max="100" step="0.5" 
                                    placeholder="Enter marks" 
                                />
                                {gradingData[sub.id]?.marks && (
                                    <span className="grading-view-grade-preview" style={{ color: getGradeColor(gradingData[sub.id]?.marks) }}>
                                        ({gradingData[sub.id]?.marks}%)
                                    </span>
                                )}
                            </div>
                            <div className="grading-view-feedback-input-group">
                                <label>Feedback:</label>
                                <textarea 
                                    className="grading-view-feedback-input" 
                                    value={gradingData[sub.id]?.feedback || ''} 
                                    onChange={(e) => handleGradeChange(sub.id, 'feedback', e.target.value)} 
                                    placeholder="Provide feedback to the student..." 
                                    rows="3" 
                                />
                            </div>
                            <button className={`grading-view-grade-submit-btn ${isGraded ? 'grading-view-update' : ''}`} onClick={() => handleSubmitGrade(sub.id)}>
                                {isGraded ? '✏️ Update Grade' : '✓ Submit Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        });
    }
};

export default GradingView;