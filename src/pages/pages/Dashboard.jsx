// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { format } from 'date-fns';

const Dashboard = ({ currentUser }) => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [stats, setStats] = useState({
    assignments: 0,
    quizzes: 0,
    announcements: 0,
    attendance: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { default: api } = await import('../../api/client');
      
      // Load assignments
      const assignmentsRes = await api.getAssignments();
      const assignments = assignmentsRes.data || [];
      
      // Filter upcoming deadlines
      const now = new Date();
      const upcoming = assignments
        .filter(a => new Date(a.due_date) > now)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);
      setUpcomingDeadlines(upcoming);
      
      // Set stats
      setStats({
        assignments: assignments.length,
        quizzes: 0,
        announcements: 0,
        attendance: 92
      });
      
      // Mock recent activities (replace with actual API calls)
      setRecentActivities([
        { id: 1, type: 'assignment', title: 'Assignment submitted', date: new Date(), course: 'Mathematics 101' },
        { id: 2, type: 'grade', title: 'Quiz grade released', date: new Date(), course: 'Physics 201' },
        { id: 3, type: 'announcement', title: 'New announcement posted', date: new Date(), course: 'Computer Science' }
      ]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard_header}>
        <div>
          <h1 className={styles.dashboard_greeting}>
            {getGreeting()}, {currentUser?.full_name || 'Student'}!
          </h1>
          <p className={styles.dashboard_subtitle}>
            Here's what's happening with your courses today
          </p>
        </div>
        <div className={styles.dashboard_date}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      <div className={styles.dashboard_stats}>
        <div className={styles.dashboard_statCard}>
          <div className={styles.dashboard_statIcon}>
            <svg className={styles.dashboard_statIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className={styles.dashboard_statInfo}>
            <h3>{stats.assignments}</h3>
            <p>Assignments</p>
          </div>
        </div>
        
        <div className={styles.dashboard_statCard}>
          <div className={styles.dashboard_statIcon}>
            <svg className={styles.dashboard_statIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={styles.dashboard_statInfo}>
            <h3>{stats.quizzes}</h3>
            <p>Quizzes</p>
          </div>
        </div>
        
        <div className={styles.dashboard_statCard}>
          <div className={styles.dashboard_statIcon}>
            <svg className={styles.dashboard_statIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <div className={styles.dashboard_statInfo}>
            <h3>{stats.announcements}</h3>
            <p>Announcements</p>
          </div>
        </div>
        
        <div className={styles.dashboard_statCard}>
          <div className={styles.dashboard_statIcon}>
            <svg className={styles.dashboard_statIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className={styles.dashboard_statInfo}>
            <h3>{stats.attendance}%</h3>
            <p>Attendance</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboard_grid}>
        <div className={styles.dashboard_card}>
          <div className={styles.dashboard_cardHeader}>
            <h2>Upcoming Deadlines</h2>
            <button className={styles.dashboard_viewAll}>View All</button>
          </div>
          <div className={styles.dashboard_deadlines}>
            {upcomingDeadlines.length === 0 ? (
              <p className={styles.dashboard_empty}>No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map(deadline => (
                <div key={deadline.id} className={styles.dashboard_deadlineItem}>
                  <div className={styles.dashboard_deadlineInfo}>
                    <h4>{deadline.title}</h4>
                    <p className={styles.dashboard_deadlineCourse}>{deadline.course?.name || 'Course'}</p>
                  </div>
                  <div className={styles.dashboard_deadlineDate}>
                    {format(new Date(deadline.due_date), 'MMM d')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.dashboard_card}>
          <div className={styles.dashboard_cardHeader}>
            <h2>Recent Activity</h2>
            <button className={styles.dashboard_viewAll}>View All</button>
          </div>
          <div className={styles.dashboard_activities}>
            {recentActivities.length === 0 ? (
              <p className={styles.dashboard_empty}>No recent activities</p>
            ) : (
              recentActivities.map(activity => (
                <div key={activity.id} className={styles.dashboard_activityItem}>
                  <div className={`${styles.dashboard_activityIcon} ${styles[`dashboard_activityIcon_${activity.type}`]}`}>
                    {activity.type === 'assignment' && '📝'}
                    {activity.type === 'grade' && '🎯'}
                    {activity.type === 'announcement' && '📢'}
                  </div>
                  <div className={styles.dashboard_activityInfo}>
                    <p className={styles.dashboard_activityTitle}>{activity.title}</p>
                    <p className={styles.dashboard_activityMeta}>
                      {activity.course} • {format(activity.date, 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;