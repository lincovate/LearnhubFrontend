import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './Timetable.css';

const Timetable = () => {
    const { user, isTeacher } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        course: '',
        day: 'MON',
        time_slot: '07:30-09:00',
        topic: '',
        venue: ''
    });
    
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const dayLabels = {
        'MON': 'Monday',
        'TUE': 'Tuesday',
        'WED': 'Wednesday',
        'THU': 'Thursday',
        'FRI': 'Friday'
    };
    
    const timeSlots = [
        '07:30-09:00', '09:00-10:30', '11:00-12:30',
        '12:30-14:00', '14:00-15:30', '15:30-17:00'
    ];
    
    const timeSlotLabels = {
        '07:30-09:00': '7:30 AM - 9:00 AM',
        '09:00-10:30': '9:00 AM - 10:30 AM',
        '11:00-12:30': '11:00 AM - 12:30 PM',
        '12:30-14:00': '12:30 PM - 2:00 PM',
        '14:00-15:30': '2:00 PM - 3:30 PM',
        '15:30-17:00': '3:30 PM - 5:00 PM'
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [timetableRes, coursesRes] = await Promise.all([
                api.getTimetable(),
                api.getCourses()
            ]);
            setTimetable(timetableRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('error', 'Failed to load timetable data');
        } finally {
            setLoading(false);
        }
    };
    
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };
    
    // Native Print/Save as PDF
    const printTimetable = () => {
        const printContent = document.querySelector('.timetable-grid').cloneNode(true);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Timetable - ${new Date().toLocaleDateString()}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            padding: 20px;
                            background: white;
                        }
                        .timetable-container {
                            max-width: 1200px;
                            margin: 0 auto;
                        }
                        .timetable-header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #667eea;
                        }
                        .timetable-header h2 {
                            color: #2c3e50;
                            font-size: 28px;
                            margin-bottom: 10px;
                        }
                        .timetable-header p {
                            color: #7f8c8d;
                            font-size: 14px;
                        }
                        .timetable-grid {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        .timetable-grid .timetable-header-row {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                        }
                        .timetable-row {
                            display: grid;
                            grid-template-columns: 180px repeat(5, 1fr);
                            border-bottom: 1px solid #ddd;
                        }
                        .timetable-time-col, .timetable-day-col {
                            padding: 12px;
                            text-align: center;
                            font-size: 14px;
                            border-right: 1px solid #ddd;
                            font-weight: 500;
                        }
                        .timetable-time-col {
                            background: #f8f9fa;
                            font-weight: 600;
                        }
                        .timetable-cell {
                            min-height: 100px;
                            padding: 10px;
                            border-right: 1px solid #ddd;
                        }
                        .timetable-cell-content {
                            height: 100%;
                        }
                        .timetable-topic {
                            font-weight: 600;
                            color: #2c3e50;
                            font-size: 14px;
                            margin-bottom: 5px;
                        }
                        .timetable-venue, .timetable-teacher {
                            font-size: 12px;
                            color: #7f8c8d;
                            margin-top: 3px;
                        }
                        .timetable-teacher {
                            color: #3498db;
                        }
                        .timetable-empty-cell {
                            text-align: center;
                            color: #bdc3c7;
                            padding-top: 40px;
                        }
                        .timetable-footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            color: #7f8c8d;
                            font-size: 12px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .timetable-no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="timetable-container">
                        <div class="timetable-header">
                            <h2>📅 Class Timetable</h2>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                            <p>User: ${user?.first_name} ${user?.last_name} (${user?.username})</p>
                        </div>
                        ${printContent.outerHTML}
                        <div class="timetable-footer">
                            <p>© ${new Date().getFullYear()} LearnHub - All Rights Reserved</p>
                            <p>This timetable is subject to change. Please check for updates regularly.</p>
                        </div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => window.close(), 1000);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };
    
    const getCellContent = (day, timeSlot) => {
        const entry = timetable.find(e => e.day === day && e.time_slot === timeSlot);
        if (entry) {
            return (
                <div className="timetable-cell-content">
                    <div className="timetable-topic">{entry.topic}</div>
                    <div className="timetable-venue">📍 {entry.venue || 'No venue'}</div>
                    <div className="timetable-teacher">👨‍🏫 {entry.teacher_name || entry.teacher?.username}</div>
                    {isTeacher && (
                        <div className="timetable-cell-actions">
                            <button 
                                className="timetable-edit-cell-btn" 
                                onClick={() => handleEdit(entry)}
                                title="Edit entry"
                            >
                                ✏️
                            </button>
                            <button 
                                className="timetable-delete-cell-btn" 
                                onClick={() => handleDelete(entry.id)}
                                title="Delete entry"
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div className="timetable-empty-cell">
                {isTeacher && (
                    <button 
                        className="timetable-add-cell-btn"
                        onClick={() => {
                            setEditingEntry(null);
                            setFormData({
                                course: '',
                                day: day,
                                time_slot: timeSlot,
                                topic: '',
                                venue: ''
                            });
                            setShowForm(true);
                        }}
                        title="Add entry"
                    >
                        +
                    </button>
                )}
            </div>
        );
    };
    
    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setFormData({
            course: entry.course,
            day: entry.day,
            time_slot: entry.time_slot,
            topic: entry.topic,
            venue: entry.venue || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleDelete = async (entryId) => {
        if (window.confirm('Are you sure you want to delete this timetable entry? This action cannot be undone.')) {
            try {
                await api.deleteTimetableEntry(entryId);
                showMessage('success', 'Timetable entry deleted successfully');
                fetchData();
            } catch (error) {
                console.error('Error deleting timetable:', error);
                showMessage('error', error.response?.data?.error || 'Failed to delete timetable entry');
            }
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.course) {
            showMessage('error', 'Please select a course');
            return;
        }
        if (!formData.topic.trim()) {
            showMessage('error', 'Please enter a topic');
            return;
        }
        
        setSubmitting(true);
        
        const submitData = {
            course: parseInt(formData.course),
            day: formData.day,
            time_slot: formData.time_slot,
            topic: formData.topic.trim(),
            venue: formData.venue.trim() || ''
        };
        
        try {
            if (editingEntry) {
                await api.updateTimetableEntry(editingEntry.id, submitData);
                showMessage('success', 'Timetable entry updated successfully!');
            } else {
                await api.createTimetableEntry(submitData);
                showMessage('success', 'Timetable entry added successfully!');
            }
            
            setShowForm(false);
            setEditingEntry(null);
            setFormData({
                course: '',
                day: 'MON',
                time_slot: '07:30-09:00',
                topic: '',
                venue: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error saving timetable:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.values(errorData).flat();
                    showMessage('error', errorMessages.join(', '));
                } else {
                    showMessage('error', errorData);
                }
            } else {
                showMessage('error', 'Failed to save timetable entry. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };
    
    const resetForm = () => {
        setShowForm(false);
        setEditingEntry(null);
        setFormData({
            course: '',
            day: 'MON',
            time_slot: '07:30-09:00',
            topic: '',
            venue: ''
        });
        setMessage({ type: '', text: '' });
    };
    
    if (loading) {
        return (
            <div className="timetable-loading-container">
                <div className="timetable-spinner"></div>
                <p>Loading timetable...</p>
            </div>
        );
    }
    
    return (
        <div className="timetable-container">
            <div className="timetable-header">
                <div>
                    <h2>📅 Class Timetable</h2>
                    <p className="timetable-subtitle">Weekly schedule for all courses</p>
                </div>
                <div className="timetable-header-buttons">
                    {!showForm && isTeacher && (
                        <button className="timetable-add-btn" onClick={() => setShowForm(true)}>
                            + Add New Entry
                        </button>
                    )}
                    <div className="timetable-download-buttons">
                        <button className="timetable-download-btn timetable-print-btn" onClick={printTimetable}>
                            🖨️ Print / Save as PDF
                        </button>
                    </div>
                </div>
            </div>
            
            {message.text && (
                <div className={`timetable-message-banner timetable-message-${message.type}`}>
                    {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'} {message.text}
                </div>
            )}
            
            {showForm && isTeacher && (
                <div className="timetable-form-overlay">
                    <form className="timetable-form" onSubmit={handleSubmit}>
                        <h3>{editingEntry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}</h3>
                        
                        <div className="timetable-form-group">
                            <label>Course *</label>
                            <select
                                value={formData.course}
                                onChange={(e) => setFormData({...formData, course: e.target.value})}
                                required
                                disabled={submitting}
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="timetable-form-row">
                            <div className="timetable-form-group">
                                <label>Day *</label>
                                <select
                                    value={formData.day}
                                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                                    required
                                    disabled={submitting}
                                >
                                    {days.map(day => (
                                        <option key={day} value={day}>{dayLabels[day]}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="timetable-form-group">
                                <label>Time Slot *</label>
                                <select
                                    value={formData.time_slot}
                                    onChange={(e) => setFormData({...formData, time_slot: e.target.value})}
                                    required
                                    disabled={submitting}
                                >
                                    {timeSlots.map(slot => (
                                        <option key={slot} value={slot}>{timeSlotLabels[slot]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="timetable-form-group">
                            <label>Topic *</label>
                            <input
                                type="text"
                                placeholder="e.g., Introduction to Python, Calculus Review"
                                value={formData.topic}
                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                required
                                disabled={submitting}
                            />
                        </div>
                        
                        <div className="timetable-form-group">
                            <label>Venue</label>
                            <input
                                type="text"
                                placeholder="e.g., Room 201, Online (Zoom), Lab B"
                                value={formData.venue}
                                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                                disabled={submitting}
                            />
                        </div>
                        
                        <div className="timetable-form-actions">
                            <button type="submit" className="timetable-save-btn" disabled={submitting}>
                                {submitting ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Entry')}
                            </button>
                            <button type="button" className="timetable-cancel-btn" onClick={resetForm} disabled={submitting}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="timetable-grid" id="timetable-export">
                <div className="timetable-row timetable-header-row">
                    <div className="timetable-time-col">Time / Day</div>
                    {days.map(day => (
                        <div key={day} className="timetable-day-col">{dayLabels[day]}</div>
                    ))}
                </div>
                
                {timeSlots.map(slot => (
                    <div key={slot} className="timetable-row">
                        <div className="timetable-time-col">{timeSlotLabels[slot]}</div>
                        {days.map(day => (
                            <div key={`${day}-${slot}`} className="timetable-cell">
                                {getCellContent(day, slot)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="timetable-footer">
                <p className="timetable-footer-note">
                    📍 Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default Timetable;