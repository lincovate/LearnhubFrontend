// src/components/references/SyllabusViewer.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FileViewer from './FileViewer';
import styles from './SyllabusViewer.module.css';

const SyllabusViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.syllabusItem;

  if (!item) {
    return (
      <div className={styles.SyllabusViewer_error}>
        <p>No syllabus item selected.</p>
        <button onClick={() => navigate(-1)} className={styles.SyllabusViewer_errorButton}>
          ← Go back
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    if (item.file_url) window.open(item.file_url, '_blank');
  };

  return (
    <div className={styles.SyllabusViewer_container}>
      <div className={styles.SyllabusViewer_header}>
        <button onClick={() => navigate(-1)} className={styles.SyllabusViewer_backButton}>
          ← Back
        </button>
        <h1 className={styles.SyllabusViewer_title}>{item.title || item.filename}</h1>
        <button onClick={handleDownload} className={styles.SyllabusViewer_downloadButton}>
          📥 Download
        </button>
      </div>
      <div className={styles.SyllabusViewer_content}>
        <FileViewer
          fileUrl={item.file_url}
          fileType={item.file_type}
          filename={item.filename}
        />
      </div>
    </div>
  );
};

export default SyllabusViewer;