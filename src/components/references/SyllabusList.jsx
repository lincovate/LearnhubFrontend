// src/components/references/SyllabusList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referencesApi } from '../../api/references';
import { api } from '../../api/client';
import styles from './SyllabusList.module.css';

const SyllabusList = ({ isTeacher: propIsTeacher }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(propIsTeacher || false);
  const [showUpload, setShowUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchItems();
    if (propIsTeacher === undefined) {
      checkUserRole();
    } else if (propIsTeacher) {
      fetchTeacherCourses();
    }
  }, [propIsTeacher]);

  const fetchItems = async () => {
    try {
      const res = await referencesApi.getSyllabusItems();
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const profile = await api.getProfile();
      const teacher = !!profile.data.teacher_profile;
      setIsTeacher(teacher);
      if (teacher) {
        const coursesRes = await api.getMyCourses();
        setCourses(coursesRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const coursesRes = await api.getMyCourses();
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (formData) => {
    await referencesApi.createSyllabusItem(formData);
    setShowUpload(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this syllabus item?')) {
      await referencesApi.deleteSyllabusItem(id);
      fetchItems();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData) => {
    await referencesApi.updateSyllabusItem(editingItem.id, formData);
    setShowEditModal(false);
    setEditingItem(null);
    fetchItems();
  };

  const openFullScreen = (item) => {
    navigate(`/syllabus/view/${item.id}`, { state: { syllabusItem: item } });
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄';
    if (fileType === 'word') return '📝';
    if (fileType === 'image') return '🖼️';
    return '📁';
  };

  if (loading) return <div className={styles.SyllabusList_loading}>Loading syllabus...</div>;

  return (
    <div className={styles.SyllabusList_container}>
      <div className={styles.SyllabusList_header}>
        <h2 className={styles.SyllabusList_title}>Syllabus</h2>
        <div className={styles.SyllabusList_headerActions}>
          <div className={styles.SyllabusList_viewToggle}>
            <button
              className={`${styles.SyllabusList_viewButton} ${viewMode === 'grid' ? styles.SyllabusList_activeView : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`${styles.SyllabusList_viewButton} ${viewMode === 'tile' ? styles.SyllabusList_activeView : ''}`}
              onClick={() => setViewMode('tile')}
              title="Tile view"
            >
              ☰ Tile
            </button>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={styles.SyllabusList_uploadButton}
            >
              {showUpload ? 'Cancel' : 'Upload Syllabus Item'}
            </button>
          )}
        </div>
      </div>

      {isTeacher && showUpload && (
        <SyllabusUploadForm
          courses={courses}
          onUpload={handleUpload}
          onCancel={() => setShowUpload(false)}
        />
      )}

      <div className={`${styles.SyllabusList_grid} ${viewMode === 'tile' ? styles.SyllabusList_tileView : ''}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.SyllabusList_card} ${viewMode === 'tile' ? styles.SyllabusList_tileCard : ''}`}
            onClick={() => openFullScreen(item)}
          >
            <div className={styles.SyllabusList_icon}>
              <span className={styles.SyllabusList_fileIcon}>{getFileIcon(item.file_type)}</span>
            </div>
            <div className={styles.SyllabusList_cardContent}>
              <h3 className={styles.SyllabusList_cardTitle}>{item.title || item.filename}</h3>
              <div className={styles.SyllabusList_cardMeta}>
                <span className={styles.SyllabusList_type}>
                  {item.file_type.toUpperCase()}
                </span>
              </div>
              <div className={styles.SyllabusList_openHint}>
                <span>👉 Click to open</span>
              </div>
              {isTeacher && (
                <div
                  className={styles.SyllabusList_actionButtons}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.SyllabusList_editButton}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.SyllabusList_deleteButton}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showEditModal && editingItem && (
        <SyllabusEditModal
          item={editingItem}
          courses={courses}
          onUpdate={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

// ========== Syllabus Upload Form (no description) ==========
const SyllabusUploadForm = ({ courses, onUpload, onCancel }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseId) {
      alert('Please select a file and a course.');
      return;
    }
    const fd = new FormData();
    fd.append('title', title);
    fd.append('file', file);
    fd.append('course', courseId);
    setUploading(true);
    await onUpload(fd);
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.SyllabusList_uploadForm}>
      <h3 className={styles.SyllabusList_formTitle}>Upload Syllabus Item</h3>
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.SyllabusList_input}
      />
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className={styles.SyllabusList_select}
        required
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} - {c.name}
          </option>
        ))}
      </select>
      <div className={styles.SyllabusList_fileInput}>
        <label>File (PDF, Word, Image)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </div>
      <div className={styles.SyllabusList_formActions}>
        <button type="submit" disabled={uploading} className={styles.SyllabusList_submitButton}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button type="button" onClick={onCancel} className={styles.SyllabusList_cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ========== Edit Modal Component ==========
const SyllabusEditModal = ({ item, courses, onUpdate, onClose }) => {
  const [title, setTitle] = useState(item.title || '');
  const [courseId, setCourseId] = useState(item.course);
  const [newFile, setNewFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('course', courseId);
    if (newFile) fd.append('file', newFile);
    setUpdating(true);
    await onUpdate(fd);
    setUpdating(false);
  };

  return (
    <div className={styles.SyllabusList_modalOverlay}>
      <div className={styles.SyllabusList_modal}>
        <h3>Edit Syllabus Item</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.SyllabusList_input}
          />
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={styles.SyllabusList_select}
            required
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <div className={styles.SyllabusList_fileInput}>
            <label>Replace File (optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setNewFile(e.target.files[0])}
            />
          </div>
          <div className={styles.SyllabusList_formActions}>
            <button type="submit" disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SyllabusList;