// src/components/references/NoteViewer.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FileViewer from './FileViewer';
import styles from './NoteViewer.module.css'; // reuse same as BookViewer or create separate

const NoteViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const note = location.state?.note;

  if (!note) {
    return (
      <div className={styles.NoteViewer_error}>
        <p>No note selected.</p>
        <button onClick={() => navigate(-1)} className={styles.NoteViewer_errorButton}>
          ← Go back
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    if (note.file_url) {
      window.open(note.file_url, '_blank');
    }
  };

  return (
    <div className={styles.NoteViewer_container}>
      <div className={styles.NoteViewer_header}>
        <button onClick={() => navigate(-1)} className={styles.NoteViewer_backButton}>
          ← Back
        </button>
        <h1 className={styles.NoteViewer_title}>{note.title}</h1>
        {note.file_url && (
          <button onClick={handleDownload} className={styles.NoteViewer_downloadButton}>
            📥 Download
          </button>
        )}
      </div>
      <div className={styles.NoteViewer_content}>
        <FileViewer
          fileUrl={note.file_url}
          fileType={note.file_type}
          filename={note.title}
        />
      </div>
    </div>
  );
};

export default NoteViewer;