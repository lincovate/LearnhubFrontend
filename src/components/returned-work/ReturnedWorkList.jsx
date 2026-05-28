// src/components/returned-work/ReturnedWorkList.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReturnedWorkList.module.css';
import ReturnedWorkCard from './ReturnedWorkCard';
import { returnedWorkApi } from '../../api/returned-work';


const ReturnedWorkList = ({ currentUser, isTeacher = false }) => {
  const [returnedWork, setReturnedWork] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unviewed, graded
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadReturnedWork();
  }, []);

  const loadReturnedWork = async () => {
    setIsLoading(true);
    try {
      const response = await returnedWorkApi.getReturnedWork();
      setReturnedWork(response.data);
      
      const statsData = await returnedWorkApi.getStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load returned work:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsViewed = async (workId) => {
    try {
      await returnedWorkApi.markAsViewed(workId);
      setReturnedWork(prev => prev.map(work =>
        work.id === workId ? { ...work, is_viewed: true, viewed_at: new Date().toISOString() } : work
      ));
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  const handleDownload = async (fileUrl) => {
    try {
      const { default: api } = await import('../../api/client');
      await api.triggerDownload(fileUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const filteredWork = returnedWork.filter(work => {
    if (filter === 'unviewed') return !work.is_viewed;
    if (filter === 'graded') return work.grade_obtained !== null;
    return true;
  });

  const groupedByCourse = () => {
    const grouped = {};
    filteredWork.forEach(work => {
      if (!grouped[work.course_name]) {
        grouped[work.course_name] = [];
      }
      grouped[work.course_name].push(work);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className={styles.returnedWorkList_loading}>
        <div className={styles.returnedWorkList_spinner}></div>
        <p>Loading returned work...</p>
      </div>
    );
  }

  const grouped = groupedByCourse();

  return (
    <div className={styles.returnedWorkList}>
      <div className={styles.returnedWorkList_header}>
        <div>
          <h1 className={styles.returnedWorkList_title}>
            {isTeacher ? 'Graded Submissions' : 'Returned Work'}
          </h1>
          <p className={styles.returnedWorkList_subtitle}>
            {isTeacher 
              ? 'View and manage work you have returned to students'
              : 'Review your graded assignments and feedback from teachers'}
          </p>
        </div>
        
        {stats && (
          <div className={styles.returnedWorkList_stats}>
            {isTeacher ? (
              <>
                <div className={styles.returnedWorkList_stat}>
                  <span className={styles.returnedWorkList_statValue}>{stats.totalGraded}</span>
                  <span className={styles.returnedWorkList_statLabel}>Total Graded</span>
                </div>
                <div className={styles.returnedWorkList_stat}>
                  <span className={styles.returnedWorkList_statValue}>{stats.averageGrade}%</span>
                  <span className={styles.returnedWorkList_statLabel}>Average Grade</span>
                </div>
                <div className={styles.returnedWorkList_stat}>
                  <span className={styles.returnedWorkList_statValue}>{stats.notViewedCount}</span>
                  <span className={styles.returnedWorkList_statLabel}>Not Viewed</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.returnedWorkList_stat}>
                  <span className={styles.returnedWorkList_statValue}>{stats.totalReturned}</span>
                  <span className={styles.returnedWorkList_statLabel}>Total Returned</span>
                </div>
                <div className={styles.returnedWorkList_stat}>
                  <span className={styles.returnedWorkList_statValue}>{stats.averageGrade}%</span>
                  <span className={styles.returnedWorkList_statLabel}>Average Grade</span>
                </div>
                <div className={styles.returnedWorkList_stat}>
                  <span className={styles.returnedWorkList_statValue}>{stats.passingRate}%</span>
                  <span className={styles.returnedWorkList_statLabel}>Passing Rate</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.returnedWorkList_filters}>
        <button
          className={`${styles.returnedWorkList_filterBtn} ${filter === 'all' ? styles.returnedWorkList_filterBtn_active : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {!isTeacher && (
          <button
            className={`${styles.returnedWorkList_filterBtn} ${filter === 'unviewed' ? styles.returnedWorkList_filterBtn_active : ''}`}
            onClick={() => setFilter('unviewed')}
          >
            Unviewed
          </button>
        )}
        <button
          className={`${styles.returnedWorkList_filterBtn} ${filter === 'graded' ? styles.returnedWorkList_filterBtn_active : ''}`}
          onClick={() => setFilter('graded')}
        >
          Graded Only
        </button>
      </div>

      {filteredWork.length === 0 ? (
        <div className={styles.returnedWorkList_empty}>
          <svg className={styles.returnedWorkList_emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={styles.returnedWorkList_emptyText}>No returned work found</p>
          <p className={styles.returnedWorkList_emptySubtext}>
            {isTeacher 
              ? 'Grade student submissions to return work here'
              : 'When teachers return your graded work, it will appear here'}
          </p>
        </div>
      ) : (
        <div className={styles.returnedWorkList_content}>
          {Object.entries(grouped).map(([courseName, works]) => (
            <div key={courseName} className={styles.returnedWorkList_courseSection}>
              <h2 className={styles.returnedWorkList_courseTitle}>{courseName}</h2>
              <div className={styles.returnedWorkList_cards}>
                {works.map(work => (
                  <ReturnedWorkCard
                    key={work.id}
                    work={work}
                    isTeacher={isTeacher}
                    onMarkAsViewed={handleMarkAsViewed}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnedWorkList;