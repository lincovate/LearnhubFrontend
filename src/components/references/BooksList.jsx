// src/components/references/BooksList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referencesApi } from '../../api/references';
import { api } from '../../api/client';
import styles from './BooksList.module.css';

const BooksList = ({ isTeacher: propIsTeacher }) => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(propIsTeacher || false);
  const [showUpload, setShowUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'tile'

  // Helper to convert relative image URL to absolute using the backend domain
  const getAbsoluteImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = 'https://gith.pythonanywhere.com';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanUrl}`;
  };

  useEffect(() => {
    fetchBooks();
    if (propIsTeacher === undefined) {
      checkUserRole();
    } else if (propIsTeacher) {
      fetchTeacherCourses();
    }
  }, [propIsTeacher]);

  const fetchBooks = async () => {
    try {
      const res = await referencesApi.getBooks();
      setBooks(res.data);
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
    await referencesApi.createBook(formData);
    setShowUpload(false);
    fetchBooks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      await referencesApi.deleteBook(id);
      fetchBooks();
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData) => {
    await referencesApi.updateBook(editingBook.id, formData);
    setShowEditModal(false);
    setEditingBook(null);
    fetchBooks();
  };

  const openFullScreen = (book) => {
    navigate(`/books/view/${book.id}`, { state: { book } });
  };

  if (loading) return <div className={styles.BooksList_loading}>Loading books...</div>;

  return (
    <div className={styles.BooksList_container}>
      <div className={styles.BooksList_header}>
        <h2 className={styles.BooksList_title}>Books & Documents</h2>
        <div className={styles.BooksList_headerActions}>
          {/* View Toggle Buttons */}
          <div className={styles.BooksList_viewToggle}>
            <button
              className={`${styles.BooksList_viewButton} ${viewMode === 'grid' ? styles.BooksList_activeView : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`${styles.BooksList_viewButton} ${viewMode === 'tile' ? styles.BooksList_activeView : ''}`}
              onClick={() => setViewMode('tile')}
              title="Tile view"
            >
              ☰ Tile
            </button>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={styles.BooksList_uploadButton}
            >
              {showUpload ? 'Cancel' : 'Upload Book'}
            </button>
          )}
        </div>
      </div>

      {isTeacher && showUpload && (
        <BookUploadForm
          courses={courses}
          onUpload={handleUpload}
          onCancel={() => setShowUpload(false)}
        />
      )}

      <div className={`${styles.BooksList_grid} ${viewMode === 'tile' ? styles.BooksList_tileView : ''}`}>
        {books.map((book) => (
          <div
            key={book.id}
            className={`${styles.BooksList_card} ${viewMode === 'tile' ? styles.BooksList_tileCard : ''}`}
            onClick={() => openFullScreen(book)}
          >
            {book.cover_image_url && (
              <img
                src={getAbsoluteImageUrl(book.cover_image_url)}
                alt={book.title}
                className={styles.BooksList_cover}
              />
            )}
            <div className={styles.BooksList_cardContent}>
              <h3 className={styles.BooksList_cardTitle}>{book.title}</h3>
              <div className={styles.BooksList_cardMeta}>
                <span className={styles.BooksList_type}>
                  {book.file_type.toUpperCase()}
                </span>
              </div>
              {/* Add click hint here */}
              <div className={styles.BooksList_openHint}>
                <span>👉 Click to open</span>
              </div>
              {isTeacher && (
                <div
                  className={styles.BooksList_actionButtons}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => handleEdit(book)} className={styles.BooksList_editButton}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(book.id)} className={styles.BooksList_deleteButton}>
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showEditModal && editingBook && (
        <BookEditModal
          book={editingBook}
          courses={courses}
          onUpdate={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

// ========== Book Upload Form (unchanged) ==========
const BookUploadForm = ({ courses, onUpload, onCancel }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('pdf');
  const [coverImage, setCoverImage] = useState(null);
  const [courseId, setCourseId] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseId || !title) {
      alert('Please provide a title, file, and course.');
      return;
    }
    const fd = new FormData();
    fd.append('title', title);
    fd.append('file', file);
    fd.append('document_type', documentType);
    if (coverImage) fd.append('cover_image', coverImage);
    fd.append('course', courseId);
    setUploading(true);
    await onUpload(fd);
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.BooksList_uploadForm}>
      <h3 className={styles.BooksList_formTitle}>Upload New Book / Document</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.BooksList_input}
        required
      />
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className={styles.BooksList_select}
        required
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} - {c.name}
          </option>
        ))}
      </select>

      <div className={styles.BooksList_documentType}>
        <span className={styles.BooksList_radioLabel}>Document Type:</span>
        <label className={styles.BooksList_radioOption}>
          <input
            type="radio"
            value="pdf"
            checked={documentType === 'pdf'}
            onChange={(e) => setDocumentType(e.target.value)}
          />
          PDF
        </label>
        <label className={styles.BooksList_radioOption}>
          <input
            type="radio"
            value="word"
            checked={documentType === 'word'}
            onChange={(e) => setDocumentType(e.target.value)}
          />
          Word
        </label>
      </div>

      <div className={styles.BooksList_fileInput}>
        <label>File (PDF or Word)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </div>
      <div className={styles.BooksList_fileInput}>
        <label>Cover Image (optional)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={(e) => setCoverImage(e.target.files[0])}
        />
      </div>
      <div className={styles.BooksList_formActions}>
        <button
          type="submit"
          disabled={uploading}
          className={styles.BooksList_submitButton}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={styles.BooksList_cancelButton}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ========== Edit Modal Component (unchanged) ==========
const BookEditModal = ({ book, courses, onUpdate, onClose }) => {
  const [title, setTitle] = useState(book.title);
  const [documentType, setDocumentType] = useState(book.document_type);
  const [courseId, setCourseId] = useState(book.course);
  const [coverImage, setCoverImage] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('document_type', documentType);
    fd.append('course', courseId);
    if (newFile) fd.append('file', newFile);
    if (coverImage) fd.append('cover_image', coverImage);
    setUpdating(true);
    await onUpdate(fd);
    setUpdating(false);
  };

  return (
    <div className={styles.BooksList_modalOverlay}>
      <div className={styles.BooksList_modal}>
        <h3>Edit Book</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.BooksList_input}
            required
          />
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={styles.BooksList_select}
            required
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <div className={styles.BooksList_documentType}>
            <span className={styles.BooksList_radioLabel}>Document Type:</span>
            <label>
              <input
                type="radio"
                value="pdf"
                checked={documentType === 'pdf'}
                onChange={(e) => setDocumentType(e.target.value)}
              />
              PDF
            </label>
            <label>
              <input
                type="radio"
                value="word"
                checked={documentType === 'word'}
                onChange={(e) => setDocumentType(e.target.value)}
              />
              Word
            </label>
          </div>
          <div className={styles.BooksList_fileInput}>
            <label>Replace File (optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setNewFile(e.target.files[0])}
            />
          </div>
          <div className={styles.BooksList_fileInput}>
            <label>Replace Cover Image (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => setCoverImage(e.target.files[0])}
            />
          </div>
          <div className={styles.BooksList_formActions}>
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

export default BooksList;