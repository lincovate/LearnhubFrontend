import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './Assignments.css';

const Assignments = () => {
    const navigate = useNavigate();
    const { user, isTeacher, isStudent, loading: authLoading } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [message, setMessage] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        due_date: '',
        total_marks: 100,
        status: 'draft',
        attachment: null
    });
    
    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        if (filePath.startsWith('http')) return filePath;
        if (!filePath.startsWith('/media/')) {
            return `/media/${filePath}`;
        }
        return filePath;
    };
    
    const getFileType = (filename) => {
        if (!filename) return 'unknown';
        const ext = filename.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const pdfTypes = ['pdf'];
        const wordTypes = ['doc', 'docx'];
        if (imageTypes.includes(ext)) return 'image';
        if (pdfTypes.includes(ext)) return 'pdf';
        if (wordTypes.includes(ext)) return 'word';
        return 'document';
    };

    const getFileIcon = (fileType) => {
        switch(fileType) {
            case 'image': return '🖼️';
            case 'pdf': return '📕';
            case 'word': return '📘';
            default: return '📎';
        }
    };

    const getFileBadgeColor = (fileType) => {
        switch(fileType) {
            case 'image': return '#9c27b0';
            case 'pdf': return '#f44336';
            case 'word': return '#2196f3';
            default: return '#9e9e9e';
        }
    };

    const handlePreview = (fileUrl, fileType) => {
        setPreviewFile(fileUrl);
        setPreviewType(fileType);
    };

    const handleViewSubmissions = (assignmentId) => {
        navigate(`/teacher/grading/${assignmentId}`);
    };

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading]);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignmentsRes, coursesRes] = await Promise.all([
                api.getAssignments(),
                api.getCourses()
            ]);
            setAssignments(assignmentsRes.data);
            setCourses(coursesRes.data);
            
            if (isStudent) {
                try {
                    const submissionsRes = await api.getSubmissions();
                    const subs = {};
                    submissionsRes.data.forEach(sub => {
                        subs[sub.assignment] = sub;
                    });
                    setSubmissions(subs);
                } catch (err) {
                    console.log('No submissions found:', err);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };
    
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };
    
    const handleEditAssignment = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            title: assignment.title,
            description: assignment.description,
            course: assignment.course,
            due_date: assignment.due_date.slice(0, 16),
            total_marks: assignment.total_marks,
            status: assignment.status,
            attachment: null
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleUpdateAssignment = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.course || !formData.due_date) {
            showMessage('error', 'Please fill in all required fields');
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('course', parseInt(formData.course, 10));
        const dueDate = new Date(formData.due_date);
        if (isNaN(dueDate.getTime())) {
            showMessage('error', 'Invalid due date');
            return;
        }
        formDataToSend.append('due_date', dueDate.toISOString());
        formDataToSend.append('total_marks', parseInt(formData.total_marks, 10));
        formDataToSend.append('status', formData.status);
        if (formData.attachment) {
            formDataToSend.append('attachment', formData.attachment);
        }
        
        try {
            await api.updateAssignment(editingAssignment.id, formDataToSend);
            showMessage('success', 'Assignment updated successfully!');
            setShowForm(false);
            setEditingAssignment(null);
            resetForm();
            fetchData();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Failed to update assignment');
        }
    };
    
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.course || !formData.due_date) {
            showMessage('error', 'Please fill in all required fields');
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('course', parseInt(formData.course, 10));
        const dueDate = new Date(formData.due_date);
        if (isNaN(dueDate.getTime())) {
            showMessage('error', 'Invalid due date');
            return;
        }
        formDataToSend.append('due_date', dueDate.toISOString());
        formDataToSend.append('total_marks', parseInt(formData.total_marks, 10));
        formDataToSend.append('status', formData.status);
        if (formData.attachment) {
            formDataToSend.append('attachment', formData.attachment);
        }
        
        try {
            await api.createAssignment(formDataToSend);
            showMessage('success', 'Assignment created successfully!');
            setShowForm(false);
            resetForm();
            fetchData();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Failed to create assignment');
        }
    };
    
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            course: '',
            due_date: '',
            total_marks: 100,
            status: 'draft',
            attachment: null
        });
    };
    
    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await api.deleteAssignment(assignmentId);
                showMessage('success', 'Assignment deleted successfully');
                fetchData();
            } catch (error) {
                showMessage('error', error.response?.data?.error || 'Failed to delete assignment');
            }
        }
    };
    
    const handleUpdateStatus = async (assignmentId, newStatus) => {
        try {
            await api.updateAssignmentStatus(assignmentId, newStatus);
            showMessage('success', `Status changed to ${newStatus}`);
            fetchData();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Failed to update status');
        }
    };
    
    const handleSubmitAssignment = async (assignmentId, file) => {
        if (!file) {
            showMessage('error', 'Please select a file');
            return;
        }
        const formData = new FormData();
        formData.append('submission_file', file);
        try {
            await api.submitAssignment(assignmentId, formData);
            showMessage('success', 'Assignment submitted successfully!');
            fetchData();
        } catch (error) {
            showMessage('error', error.response?.data?.error || 'Failed to submit');
        }
    };
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'published': return '#4caf50';
            case 'draft': return '#ff9800';
            case 'closed': return '#f44336';
            default: return '#9e9e9e';
        }
    };
    
    if (authLoading || loading) {
        return (
            <div className="assignment-loading-container">
                <div className="assignment-spinner"></div>
                <p>Loading assignments...</p>
            </div>
        );
    }
    
    return (
        <div className="assignment-container">
            <div className="assignment-header">
                <div>
                    <h2 className="assignment-title">📝 Assignments</h2>
                    <p className="assignment-subtitle">Manage and submit your coursework</p>
                </div>
                {isTeacher && (
                    <button className="assignment-create-btn" onClick={() => {
                        setEditingAssignment(null);
                        resetForm();
                        setShowForm(!showForm);
                    }}>
                        {showForm ? 'Cancel' : '+ Create Assignment'}
                    </button>
                )}
            </div>
            
            {message && (
                <div className={`assignment-message-banner assignment-message-${message.type}`}>
                    {message.type === 'success' ? '✅' : '❌'} {message.text}
                </div>
            )}
            
            {showForm && isTeacher && (
                <form className="assignment-form" onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}>
                    <h3 className="assignment-form-title">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
                    <div className="assignment-form-group">
                        <label className="assignment-form-label">Title *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="assignment-form-input" required />
                    </div>
                    <div className="assignment-form-group">
                        <label className="assignment-form-label">Description *</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="assignment-form-textarea" rows="5" required />
                    </div>
                    <div className="assignment-form-row">
                        <div className="assignment-form-group">
                            <label className="assignment-form-label">Course *</label>
                            <select value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} className="assignment-form-select" required>
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="assignment-form-group">
                            <label className="assignment-form-label">Due Date *</label>
                            <input type="datetime-local" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="assignment-form-input" required />
                        </div>
                    </div>
                    <div className="assignment-form-row">
                        <div className="assignment-form-group">
                            <label className="assignment-form-label">Total Marks *</label>
                            <input type="number" value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: e.target.value})} className="assignment-form-input" min="1" max="1000" required />
                        </div>
                        <div className="assignment-form-group">
                            <label className="assignment-form-label">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="assignment-form-select">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <div className="assignment-form-group">
                        <label className="assignment-form-label">Attachment</label>
                        <input type="file" onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})} className="assignment-form-file" accept=".pdf,.doc,.docx,.txt,.zip" />
                    </div>
                    <div className="assignment-form-actions">
                        <button type="submit" className="assignment-save-btn">{editingAssignment ? 'Update' : 'Create'}</button>
                        <button type="button" className="assignment-cancel-btn" onClick={() => { setShowForm(false); setEditingAssignment(null); }}>Cancel</button>
                    </div>
                </form>
            )}
            
            <div className="assignment-grid">
                {assignments.length === 0 ? (
                    <div className="assignment-no-data">
                        <p>No assignments available.</p>
                        {isTeacher && <p>Click "Create Assignment" to get started.</p>}
                    </div>
                ) : (
                    assignments.map(assignment => {
                        const fileType = assignment.attachment ? getFileType(assignment.attachment) : null;
                        const fileUrl = getFileUrl(assignment.attachment);
                        return (
                            <div key={assignment.id} className="assignment-card">
                                <div className="assignment-card-header">
                                    <h3 className="assignment-card-title">{assignment.title}</h3>
                                    <div className="assignment-status-controls">
                                        {isTeacher ? (
                                            <select value={assignment.status} onChange={(e) => handleUpdateStatus(assignment.id, e.target.value)} className="assignment-status-select" style={{background: getStatusColor(assignment.status)}}>
                                                <option value="draft">📝 Draft</option>
                                                <option value="published">✓ Published</option>
                                                <option value="closed">🔒 Closed</option>
                                            </select>
                                        ) : (
                                            <span className="assignment-status-badge" style={{background: getStatusColor(assignment.status)}}>{assignment.status}</span>
                                        )}
                                        {isTeacher && (
                                            <div className="assignment-actions">
                                                <button className="assignment-edit-btn" onClick={() => handleEditAssignment(assignment)}>✏️</button>
                                                <button className="assignment-delete-btn" onClick={() => handleDeleteAssignment(assignment.id)}>🗑️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="assignment-card-body">
                                    <p className="assignment-description">{assignment.description}</p>
                                    <div className="assignment-meta">
                                        <div className="assignment-meta-item">📚 {assignment.course_code} - {assignment.course_name}</div>
                                        <div className="assignment-meta-item">📅 Due: {new Date(assignment.due_date).toLocaleString()}</div>
                                        <div className="assignment-meta-item">📊 Total: {assignment.total_marks} marks</div>
                                        {assignment.is_overdue && <div className="assignment-meta-item assignment-overdue">⚠️ Overdue!</div>}
                                    </div>
                                    {assignment.attachment && (
                                        <div className="assignment-file-attachment">
                                            <div className="assignment-file-badge" style={{ background: getFileBadgeColor(fileType) }}>{getFileIcon(fileType)} {fileType?.toUpperCase()}</div>
                                            <div className="assignment-file-info">
                                                <span className="assignment-file-name">{assignment.attachment.split('/').pop()}</span>
                                                <div className="assignment-file-actions">
                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="assignment-download-link">📎 Download</a>
                                                    {fileType === 'image' && <button className="assignment-preview-link" onClick={() => handlePreview(fileUrl, 'image')}>👁️ Preview</button>}
                                                    {fileType === 'pdf' && <button className="assignment-preview-link" onClick={() => handlePreview(fileUrl, 'pdf')}>📄 Preview</button>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {isStudent && (
                                        <div className="assignment-submission-area">
                                            {submissions[assignment.id] ? (
                                                <div className="assignment-submitted-info">
                                                    <div className="assignment-success-icon">✅</div>
                                                    <div><strong>Submitted!</strong> on {new Date(submissions[assignment.id].submitted_at).toLocaleString()}</div>
                                                    {submissions[assignment.id].is_late && <div className="assignment-late-badge">⚠️ Late Submission</div>}
                                                    {submissions[assignment.id].grade_info && (
                                                        <div className="assignment-grade-result">
                                                            <div>Score: {submissions[assignment.id].grade_info.marks_obtained}/{assignment.total_marks}</div>
                                                            <div className="assignment-letter-grade">Grade: {submissions[assignment.id].grade_info.letter_grade}</div>
                                                            <div className="assignment-feedback">Feedback: {submissions[assignment.id].grade_info.feedback || "No feedback yet"}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="assignment-submit-form">
                                                    <input type="file" id={`file-${assignment.id}`} onChange={(e) => handleSubmitAssignment(assignment.id, e.target.files[0])} className="assignment-file-input" accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png" />
                                                    <label htmlFor={`file-${assignment.id}`} className="assignment-file-label">📁 Choose File</label>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isTeacher && (
                                        <div className="assignment-teacher-actions">
                                            <button className="assignment-view-submissions-btn" onClick={() => handleViewSubmissions(assignment.id)}>📋 View Submissions ({assignment.submissions_count})</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {previewFile && (
                <div className="assignment-preview-modal-overlay" onClick={() => setPreviewFile(null)}>
                    <div className="assignment-preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="assignment-preview-header"><h3>File Preview</h3><button className="assignment-close-preview" onClick={() => setPreviewFile(null)}>×</button></div>
                        <div className="assignment-preview-body">
                            {previewType === 'image' && <img src={previewFile} alt="Preview" className="assignment-preview-image" />}
                            {previewType === 'pdf' && <iframe src={previewFile} title="PDF Preview" className="assignment-preview-pdf" />}
                            {previewType !== 'image' && previewType !== 'pdf' && (
                                <div className="assignment-preview-placeholder"><div className="assignment-preview-icon">📄</div><p>Preview not available.</p><a href={previewFile} download className="assignment-download-file-btn">Download File</a></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;