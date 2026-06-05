// src/components/references/FileViewer.jsx
import React from 'react';
import styles from './FileViewer.module.css';

// Fixed backend base URL (no /api suffix)
const BACKEND_BASE_URL = 'https://gith.pythonanywhere.com';

// Helper to get absolute URL pointing to backend
const getAbsoluteUrl = (url) => {
  if (!url) return url;
  // If it's already a full URL (http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend the backend base URL
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_BASE_URL}${cleanUrl}`;
};

const FileViewer = ({ fileUrl, fileType, filename }) => {
  if (!fileUrl) return <p className={styles.FileViewer_noFile}>No file available</p>;

  const absoluteUrl = getAbsoluteUrl(fileUrl);

  if (fileType === 'image') {
    return <img src={absoluteUrl} alt={filename} className={styles.FileViewer_image} />;
  }
  if (fileType === 'pdf') {
    return <embed src={absoluteUrl} type="application/pdf" className={styles.FileViewer_pdf} />;
  }
  if (fileType === 'word') {
    const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    return <iframe src={googleViewer} title={filename} className={styles.FileViewer_word} />;
  }
  // Fallback: download link
  return (
    <a href={absoluteUrl} download={filename} className={styles.FileViewer_downloadLink}>
      Download {filename}
    </a>
  );
};

export default FileViewer;