// src/components/references/VideoViewer.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './VideoViewer.module.css';

const VideoViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const video = location.state?.video;

  if (!video) {
    return (
      <div className={styles.VideoViewer_error}>
        <p>No video selected.</p>
        <button onClick={() => navigate(-1)} className={styles.VideoViewer_errorButton}>
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.VideoViewer_container}>
      <div className={styles.VideoViewer_header}>
        <button onClick={() => navigate(-1)} className={styles.VideoViewer_backButton}>
          ← Back
        </button>
        <h1 className={styles.VideoViewer_title}>{video.title}</h1>
      </div>
      <div className={styles.VideoViewer_content}>
        <iframe
          src={video.embed_url}
          className={styles.VideoViewer_iframe}
          frameBorder="0"
          allowFullScreen
          title={video.title}
        />
      </div>
    </div>
  );
};

export default VideoViewer;