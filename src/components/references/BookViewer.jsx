// src/components/references/BookViewer.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FileViewer from './FileViewer';
import styles from './BookViewer.module.css';

const BookViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state?.book;

  if (!book) {
    return (
      <div className={styles.BookViewer_error}>
        <p>No book selected.</p>
        <button onClick={() => navigate(-1)} className={styles.BookViewer_errorButton}>
          ← Go back
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    if (book.file_url) {
      // Open the file URL in a new tab – triggers download for non‑embeddable files
      window.open(book.file_url, '_blank');
    }
  };

  return (
    <div className={styles.BookViewer_container}>
      <div className={styles.BookViewer_header}>
        <button onClick={() => navigate(-1)} className={styles.BookViewer_backButton}>
          ← Back
        </button>
        <h1 className={styles.BookViewer_title}>{book.title}</h1>
        {book.file_url && (
          <button onClick={handleDownload} className={styles.BookViewer_downloadButton}>
            📥 Download
          </button>
        )}
      </div>
      <div className={styles.BookViewer_content}>
        <FileViewer
          fileUrl={book.file_url}
          fileType={book.file_type}
          filename={book.title}
        />
      </div>
    </div>
  );
};

export default BookViewer;