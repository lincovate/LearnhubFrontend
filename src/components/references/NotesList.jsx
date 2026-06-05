// src/components/references/NotesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referencesApi } from '../../api/references';
import { api } from '../../api/client';
import styles from './NotesList.module.css';

const NotesList = ({ isTeacher: propIsTeacher }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(propIsTeacher || false);
  const [showUpload, setShowUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'tile'

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
      const res = await referencesApi.getNotes();
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
    await referencesApi.createNote(formData);
    setShowUpload(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      await referencesApi.deleteNote(id);
      fetchItems();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData) => {
    await referencesApi.updateNote(editingItem.id, formData);
    setShowEditModal(false);
    setEditingItem(null);
    fetchItems();
  };

  const openFullScreen = (item) => {
    navigate(`/notes/view/${item.id}`, { state: { note: item } });
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄';
    if (fileType === 'word') return '📝';
    return '📁';
  };

  if (loading) return <div className={styles.NotesList_loading}>Loading notes...</div>;

  return (
    <div className={styles.NotesList_container}>
      <div className={styles.NotesList_header}>
        <h2 className={styles.NotesList_title}>Notes</h2>
        <div className={styles.NotesList_headerActions}>
          {/* View Toggle Buttons */}
          <div className={styles.NotesList_viewToggle}>
            <button
              className={`${styles.NotesList_viewButton} ${viewMode === 'grid' ? styles.NotesList_activeView : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`${styles.NotesList_viewButton} ${viewMode === 'tile' ? styles.NotesList_activeView : ''}`}
              onClick={() => setViewMode('tile')}
              title="Tile view"
            >
              ☰ Tile
            </button>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={styles.NotesList_uploadButton}
            >
              {showUpload ? 'Cancel' : 'Upload Note'}
            </button>
          )}
        </div>
      </div>

      {isTeacher && showUpload && (
        <NotesUploadForm
          courses={courses}
          onUpload={handleUpload}
          onCancel={() => setShowUpload(false)}
        />
      )}

      <div className={`${styles.NotesList_grid} ${viewMode === 'tile' ? styles.NotesList_tileView : ''}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.NotesList_card} ${viewMode === 'tile' ? styles.NotesList_tileCard : ''}`}
            onClick={() => openFullScreen(item)}
          >
            <div className={styles.NotesList_icon}>
              <span className={styles.NotesList_fileIcon}>{getFileIcon(item.file_type)}</span>
            </div>
            <div className={styles.NotesList_cardContent}>
              <h3 className={styles.NotesList_cardTitle}>{item.title}</h3>
              {item.description && (
                <p className={styles.NotesList_description}>{item.description.slice(0, 100)}</p>
              )}
              <div className={styles.NotesList_cardMeta}>
                <span className={styles.NotesList_type}>
                  {item.file_type.toUpperCase()}
                </span>
              </div>
              <div className={styles.NotesList_openHint}>
                <span>👉 Click to open</span>
              </div>
              {isTeacher && (
                <div
                  className={styles.NotesList_actionButtons}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.NotesList_editButton}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.NotesList_deleteButton}
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
        <NotesEditModal
          item={editingItem}
          courses={courses}
          onUpdate={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

// ========== Notes Upload Form ==========
const NotesUploadForm = ({ courses, onUpload, onCancel }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseId || !title) {
      alert('Please provide title, file, and course.');
      return;
    }
    const fd = new FormData();
    fd.append('title', title);
    fd.append('file', file);
    fd.append('description', description);
    fd.append('course', courseId);
    setUploading(true);
    await onUpload(fd);
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.NotesList_uploadForm}>
      <h3 className={styles.NotesList_formTitle}>Upload Note</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.NotesList_input}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.NotesList_textarea}
        rows="2"
      />
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className={styles.NotesList_select}
        required
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} - {c.name}
          </option>
        ))}
      </select>
      <div className={styles.NotesList_fileInput}>
        <label>File (PDF or Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </div>
      <div className={styles.NotesList_formActions}>
        <button
          type="submit"
          disabled={uploading}
          className={styles.NotesList_submitButton}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={styles.NotesList_cancelButton}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ========== Edit Modal Component ==========
const NotesEditModal = ({ item, courses, onUpdate, onClose }) => {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [courseId, setCourseId] = useState(item.course);
  const [newFile, setNewFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('course', courseId);
    if (newFile) fd.append('file', newFile);
    setUpdating(true);
    await onUpdate(fd);
    setUpdating(false);
  };

  return (
    <div className={styles.NotesList_modalOverlay}>
      <div className={styles.NotesList_modal}>
        <h3>Edit Note</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.NotesList_input}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.NotesList_textarea}
            rows="2"
          />
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={styles.NotesList_select}
            required
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <div className={styles.NotesList_fileInput}>
            <label>Replace File (optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setNewFile(e.target.files[0])}
            />
          </div>
          <div className={styles.NotesList_formActions}>
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

export default NotesList;