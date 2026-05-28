// src/components/reference/MaterialCard.jsx
import React, { useState } from 'react';
import styles from './MaterialCard.module.css';
import { referenceApi } from '../../api/reference';

const MaterialCard = ({ material, onDelete, isTeacher = false }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getMaterialIcon = () => {
    switch (material.material_type) {
      case 'book':
        return (
          <svg className={styles.materialCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'notes':
        return (
          <svg className={styles.materialCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className={styles.materialCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'link':
        return (
          <svg className={styles.materialCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m1.172-4.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102" />
          </svg>
        );
      default:
        return (
          <svg className={styles.materialCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getTypeBadgeClass = () => {
    switch (material.material_type) {
      case 'book': return styles.materialCard_typeBadge_book;
      case 'notes': return styles.materialCard_typeBadge_notes;
      case 'syllabus': return styles.materialCard_typeBadge_syllabus;
      case 'past_paper': return styles.materialCard_typeBadge_pastPaper;
      case 'video': return styles.materialCard_typeBadge_video;
      default: return styles.materialCard_typeBadge_default;
    }
  };

  const handleDownload = async () => {
    if (material.file) {
      setIsDownloading(true);
      try {
        const { default: api } = await import('../../api/client');
        await referenceApi.incrementDownload(material.id);
        await api.triggerDownload(material.file);
      } catch (error) {
        console.error('Download failed:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleOpenLink = () => {
    if (material.external_url) {
      window.open(material.external_url, '_blank');
      referenceApi.incrementView(material.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${material.title}"? This action cannot be undone.`)) {
      onDelete(material.id);
    }
  };

  return (
    <div className={styles.materialCard}>
      <div className={styles.materialCard_iconContainer}>
        {getMaterialIcon()}
      </div>
      
      <div className={styles.materialCard_content}>
        <div className={styles.materialCard_header}>
          <h3 className={styles.materialCard_title}>{material.title}</h3>
          <span className={`${styles.materialCard_typeBadge} ${getTypeBadgeClass()}`}>
            {material.material_type_display}
          </span>
        </div>
        
        {material.description && (
          <p className={styles.materialCard_description}>{material.description}</p>
        )}
        
        {(material.author || material.publisher) && (
          <div className={styles.materialCard_meta}>
            {material.author && (
              <span className={styles.materialCard_author}>
                By: {material.author}
              </span>
            )}
            {material.publisher && (
              <span className={styles.materialCard_publisher}>
                {material.publisher}
              </span>
            )}
            {material.year_published && (
              <span className={styles.materialCard_year}>
                {material.year_published}
              </span>
            )}
          </div>
        )}
        
        <div className={styles.materialCard_footer}>
          <div className={styles.materialCard_stats}>
            <span className={styles.materialCard_stat}>
              <svg className={styles.materialCard_statIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {material.view_count || 0} views
            </span>
            <span className={styles.materialCard_stat}>
              <svg className={styles.materialCard_statIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {material.download_count || 0} downloads
            </span>
          </div>
          
          <div className={styles.materialCard_actions}>
            {material.file && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={styles.materialCard_actionBtn}
              >
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
            )}
            {material.external_url && (
              <button
                onClick={handleOpenLink}
                className={styles.materialCard_actionBtn}
              >
                Open Link
              </button>
            )}
            {isTeacher && (
              <button
                onClick={handleDelete}
                className={`${styles.materialCard_actionBtn} ${styles.materialCard_actionBtn_danger}`}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;