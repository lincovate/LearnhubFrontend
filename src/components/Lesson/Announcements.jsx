import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './Announcements.css';

const Announcements = () => {
    const { user, isTeacher, isStudent, loading: authLoading } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [importantAnnouncements, setImportantAnnouncements] = useState([]);
    const [regularAnnouncements, setRegularAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        course: '',
        is_important: false,
        attachment: null
    });
    
    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading]);
    
    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        if (importantAnnouncements.length > 1) {
            const interval = setInterval(() => {
                setCurrentCarouselIndex((prevIndex) => 
                    prevIndex === importantAnnouncements.length - 1 ? 0 : prevIndex + 1
                );
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [importantAnnouncements.length]);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [announcementsRes, coursesRes] = await Promise.all([
                api.getAnnouncements(),
                api.getCourses()
            ]);
            // Sort announcements by most recent first
            const sortedAnnouncements = announcementsRes.data.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            
            // Separate important and regular announcements
            const important = sortedAnnouncements.filter(a => a.is_important);
            const regular = sortedAnnouncements.filter(a => !a.is_important);
            
            setImportantAnnouncements(important);
            setRegularAnnouncements(regular);
            setAnnouncements(sortedAnnouncements);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDownload = async (attachmentUrl, filename) => {
        if (!attachmentUrl) return;
        
        setDownloading(true);
        try {
            // Extract filename from URL if not provided
            if (!filename) {
                const urlParts = attachmentUrl.split('/');
                filename = urlParts[urlParts.length - 1];
                // Remove query parameters if any
                filename = filename.split('?')[0];
            }
            
            // Use the authenticated download method
            const success = await api.triggerDownload(attachmentUrl, filename);
            
            if (!success) {
                alert('Download failed. Please try again.');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading file. Please check your connection.');
        } finally {
            setDownloading(false);
        }
    };
    
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content || !formData.course) {
            alert('Please fill in all required fields');
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('course', parseInt(formData.course, 10));
        formDataToSend.append('is_important', formData.is_important ? 'true' : 'false');
        if (formData.attachment) {
            formDataToSend.append('attachment', formData.attachment);
        }
        
        try {
            await api.createAnnouncement(formDataToSend);
            alert('Announcement posted successfully!');
            setShowForm(false);
            setFormData({ 
                title: '', 
                content: '', 
                course: '', 
                is_important: false, 
                attachment: null 
            });
            fetchData();
        } catch (error) {
            console.error('Error posting announcement:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                let errorMessage = 'Failed to post announcement:\n';
                if (typeof errorData === 'object') {
                    for (const [key, value] of Object.entries(errorData)) {
                        errorMessage += `\n${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    }
                } else {
                    errorMessage += errorData;
                }
                alert(errorMessage);
            } else {
                alert('Failed to post announcement');
            }
        }
    };
    
    const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            course: announcement.course,
            is_important: announcement.is_important,
            attachment: null
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleUpdateAnnouncement = async (e) => {
        e.preventDefault();
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('course', parseInt(formData.course, 10));
        formDataToSend.append('is_important', formData.is_important ? 'true' : 'false');
        if (formData.attachment) {
            formDataToSend.append('attachment', formData.attachment);
        }
        
        try {
            await api.updateAnnouncement(editingAnnouncement.id, formDataToSend);
            alert('Announcement updated successfully!');
            setShowForm(false);
            setEditingAnnouncement(null);
            setFormData({ 
                title: '', 
                content: '', 
                course: '', 
                is_important: false, 
                attachment: null 
            });
            fetchData();
        } catch (error) {
            console.error('Error updating announcement:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData).map(([key, value]) => {
                        return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    }).join('\n');
                    alert(`Failed to update announcement:\n${errorMessages}`);
                } else {
                    alert(errorData);
                }
            } else {
                alert('Failed to update announcement');
            }
        }
    };
    
    const handleDeleteAnnouncement = async (announcementId) => {
        if (window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
            try {
                await api.deleteAnnouncement(announcementId);
                alert('Announcement deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting announcement:', error);
                alert(error.response?.data?.error || 'Failed to delete announcement');
            }
        }
    };
    
    const goToPreviousSlide = () => {
        setCurrentCarouselIndex((prevIndex) => 
            prevIndex === 0 ? importantAnnouncements.length - 1 : prevIndex - 1
        );
    };
    
    const goToNextSlide = () => {
        setCurrentCarouselIndex((prevIndex) => 
            prevIndex === importantAnnouncements.length - 1 ? 0 : prevIndex + 1
        );
    };
    
    if (authLoading || loading) {
        return (
            <div className="announcement-loading-container">
                <div className="announcement-spinner"></div>
                <p>Loading announcements...</p>
            </div>
        );
    }
    
    const currentImportant = importantAnnouncements[currentCarouselIndex];
    
    return (
        <div className="announcement-container">
            <div className="announcement-header">
                <div>
                    <h2 className="announcement-title">📢 Announcements & Updates</h2>
                    <p className="announcement-subtitle">Stay informed about important updates</p>
                </div>
                {isTeacher && (
                    <button className="announcement-post-btn" onClick={() => {
                        setEditingAnnouncement(null);
                        setFormData({ 
                            title: '', 
                            content: '', 
                            course: '', 
                            is_important: false, 
                            attachment: null 
                        });
                        setShowForm(!showForm);
                    }}>
                        {showForm ? 'Cancel' : '+ Post Announcement'}
                    </button>
                )}
            </div>
            
            {showForm && isTeacher && (
                <form className="announcement-form" onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}>
                    <h3 className="announcement-form-title">{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h3>
                    
                    <div className="announcement-form-group">
                        <label className="announcement-form-label">Title *</label>
                        <input
                            type="text"
                            placeholder="Announcement title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            className="announcement-form-input"
                        />
                    </div>
                    
                    <div className="announcement-form-group">
                        <label className="announcement-form-label">Content *</label>
                        <textarea
                            placeholder="Write your announcement here..."
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            rows="5"
                            required
                            className="announcement-form-textarea"
                        />
                    </div>
                    
                    <div className="announcement-form-group">
                        <label className="announcement-form-label">Course *</label>
                        <select
                            value={formData.course}
                            onChange={(e) => setFormData({...formData, course: e.target.value})}
                            required
                            className="announcement-form-select"
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <label className="announcement-checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.is_important}
                            onChange={(e) => setFormData({...formData, is_important: e.target.checked})}
                        />
                        <span>📢 Mark as Important (will be highlighted as carousel)</span>
                    </label>
                    
                    <div className="announcement-form-group">
                        <label className="announcement-form-label">Attachment (Optional)</label>
                        <input
                            type="file"
                            onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            className="announcement-form-file"
                        />
                        <small className="announcement-form-hint">Allowed: PDF, DOC, DOCX, JPG, PNG</small>
                    </div>
                    
                    <div className="announcement-form-actions">
                        <button type="submit" className="announcement-save-btn">
                            {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                        </button>
                        <button type="button" className="announcement-cancel-btn" onClick={() => {
                            setShowForm(false);
                            setEditingAnnouncement(null);
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            
            {/* Important Announcements Carousel */}
            {importantAnnouncements.length > 0 && (
                <div className="announcement-carousel">
                    <div className="announcement-carousel-container">
                        <button 
                            className="announcement-carousel-btn announcement-carousel-prev"
                            onClick={goToPreviousSlide}
                        >
                            ❮
                        </button>
                        
                        <div className="announcement-carousel-slide">
                            <div className="announcement-carousel-card">
                                <div className="announcement-carousel-badge">📢 IMPORTANT ANNOUNCEMENT</div>
                                <h2 className="announcement-carousel-title">{currentImportant.title}</h2>
                                <p className="announcement-carousel-content">{currentImportant.content}</p>
                                <div className="announcement-carousel-meta">
                                    <span className="announcement-carousel-course">{currentImportant.course_code}</span>
                                    <span className="announcement-carousel-date">
                                        {new Date(currentImportant.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {currentImportant.attachment && (
                                    <button 
                                        onClick={() => handleDownload(currentImportant.attachment)}
                                        className="announcement-carousel-attachment"
                                        disabled={downloading}
                                    >
                                        📎 {downloading ? 'Downloading...' : 'Download Attachment'}
                                    </button>
                                )}
                                <div className="announcement-carousel-footer">
                                    <span className="announcement-carousel-author">
                                        Posted by: {currentImportant.created_by_full_name || currentImportant.created_by_name}
                                    </span>
                                </div>
                                {isTeacher && (
                                    <div className="announcement-carousel-actions">
                                        <button 
                                            className="announcement-edit-btn"
                                            onClick={() => handleEditAnnouncement(currentImportant)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className="announcement-delete-btn"
                                            onClick={() => handleDeleteAnnouncement(currentImportant.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            className="announcement-carousel-btn announcement-carousel-next"
                            onClick={goToNextSlide}
                        >
                            ❯
                        </button>
                    </div>
                    
                    <div className="announcement-carousel-dots">
                        {importantAnnouncements.map((_, idx) => (
                            <button
                                key={idx}
                                className={`announcement-carousel-dot ${idx === currentCarouselIndex ? 'active' : ''}`}
                                onClick={() => setCurrentCarouselIndex(idx)}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Regular Announcements List */}
            <div className="announcement-list">
                <h3 className="announcement-list-title">
                    {regularAnnouncements.length > 0 ? 'All Announcements' : 'No Announcements'}
                </h3>
                
                {regularAnnouncements.length === 0 && importantAnnouncements.length === 0 ? (
                    <div className="announcement-empty">
                        <p>No announcements yet.</p>
                        {isTeacher && <p>Click "Post Announcement" to get started.</p>}
                    </div>
                ) : (
                    <div className="announcement-grid">
                        {regularAnnouncements.map(announcement => (
                            <div key={announcement.id} className="announcement-card">
                                <div className="announcement-card-header">
                                    <h3 className="announcement-card-title">{announcement.title}</h3>
                                    <div className="announcement-card-meta">
                                        <span className="announcement-card-course">{announcement.course_code}</span>
                                        <span className="announcement-card-date">
                                            {new Date(announcement.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {isTeacher && (
                                        <div className="announcement-card-actions">
                                            <button 
                                                className="announcement-edit-btn"
                                                onClick={() => handleEditAnnouncement(announcement)}
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="announcement-delete-btn"
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="announcement-card-content">
                                    <p>{announcement.content}</p>
                                    {announcement.attachment && (
                                        <button 
                                            onClick={() => handleDownload(announcement.attachment)}
                                            className="announcement-card-attachment"
                                            disabled={downloading}
                                        >
                                            📎 {downloading ? 'Downloading...' : 'Download Attachment'}
                                        </button>
                                    )}
                                </div>
                                <div className="announcement-card-footer">
                                    <span className="announcement-card-author">
                                        Posted by: {announcement.created_by_full_name || announcement.created_by_name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;