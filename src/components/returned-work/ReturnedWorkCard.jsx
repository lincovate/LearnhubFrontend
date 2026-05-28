// src/components/returned-work/ReturnedWorkCard.jsx
import React, { useState } from 'react';
import styles from './ReturnedWorkCard.module.css';
import { formatDistanceToNow, format } from 'date-fns';

const ReturnedWorkCard = ({ work, isTeacher = false, onMarkAsViewed, onDownload }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const getGradeColor = (grade) => {
    if (grade >= 80) return styles.returnedWorkCard_grade_excellent;
    if (grade >= 70) return styles.returnedWorkCard_grade_good;
    if (grade >= 60) return styles.returnedWorkCard_grade_average;
    if (grade >= 50) return styles.returnedWorkCard_grade_pass;
    return styles.returnedWorkCard_grade_fail;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(work.returned_file);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMarkAsViewed = async () => {
    if (!work.is_viewed && onMarkAsViewed) {
      await onMarkAsViewed(work.id);
    }
  };

  // Auto-mark as viewed when component mounts (student view)
  React.useEffect(() => {
    if (!isTeacher && !work.is_viewed) {
      handleMarkAsViewed();
    }
  }, []);

  return (
    <div className={styles.returnedWorkCard}>
      <div className={styles.returnedWorkCard_header}>
        <div className={styles.returnedWorkCard_titleSection}>
          <h3 className={styles.returnedWorkCard_title}>{work.assignment_title}</h3>
          {!isTeacher && !work.is_viewed && (
            <span className={styles.returnedWorkCard_newBadge}>New</span>
          )}
        </div>
        <div className={styles.returnedWorkCard_date}>
          Returned {formatDistanceToNow(new Date(work.returned_at), { addSuffix: true })}
        </div>
      </div>

      <div className={styles.returnedWorkCard_content}>
        <div className={styles.returnedWorkCard_info}>
          <div className={styles.returnedWorkCard_infoRow}>
            <span className={styles.returnedWorkCard_label}>Course:</span>
            <span className={styles.returnedWorkCard_value}>{work.course_name}</span>
          </div>
          <div className={styles.returnedWorkCard_infoRow}>
            <span className={styles.returnedWorkCard_label}>Student:</span>
            <span className={styles.returnedWorkCard_value}>{work.student_name}</span>
          </div>
          {isTeacher && (
            <div className={styles.returnedWorkCard_infoRow}>
              <span className={styles.returnedWorkCard_label}>Viewed:</span>
              <span className={styles.returnedWorkCard_value}>
                {work.is_viewed ? (
                  <>
                    Yes - {work.viewed_at && formatDistanceToNow(new Date(work.viewed_at), { addSuffix: true })}
                  </>
                ) : (
                  'Not yet viewed'
                )}
              </span>
            </div>
          )}
        </div>

        {work.grade_obtained !== null && work.grade_obtained !== undefined && (
          <div className={styles.returnedWorkCard_gradeSection}>
            <div className={`${styles.returnedWorkCard_grade} ${getGradeColor(work.grade_obtained)}`}>
              {work.grade_obtained}%
            </div>
            <div className={styles.returnedWorkCard_gradeLabel}>Grade</div>
          </div>
        )}
      </div>

      {work.feedback && (
        <div className={styles.returnedWorkCard_feedbackSection}>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className={styles.returnedWorkCard_feedbackToggle}
          >
            <svg className={styles.returnedWorkCard_feedbackIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {showFeedback ? 'Hide Feedback' : 'View Feedback'}
          </button>
          
          {showFeedback && (
            <div className={styles.returnedWorkCard_feedbackContent}>
              {work.feedback}
            </div>
          )}
        </div>
      )}

      <div className={styles.returnedWorkCard_actions}>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={styles.returnedWorkCard_downloadBtn}
        >
          <svg className={styles.returnedWorkCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          {isDownloading ? 'Downloading...' : 'Download Returned Work'}
        </button>
        
        {!isTeacher && work.original_submission_file && (
          <button
            onClick={() => onDownload(work.original_submission_file)}
            className={styles.returnedWorkCard_viewBtn}
          >
            <svg className={styles.returnedWorkCard_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Original Submission
          </button>
        )}
      </div>
    </div>
  );
};

export default ReturnedWorkCard;