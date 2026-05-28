// src/pages/ReferencePage.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReferencePage.module.css';
import ReferenceMaterials from '../../components/reference/ReferenceMaterials';

const ReferencePage = ({ currentUser }) => {
  const [userCourses, setUserCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    loadUserCourses();
    setIsTeacher(!!currentUser?.teacher_profile);
  }, [currentUser]);

  const loadUserCourses = async () => {
    try {
      const { default: api } = await import('../../api/client');
      const response = await api.getMyCourses();
      setUserCourses(response.data);
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleCourseChange = (course) => {
    setSelectedCourse(course);
  };

  if (!selectedCourse) {
    return (
      <div className={styles.referencePage_loading}>
        <div className={styles.referencePage_spinner}></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className={styles.referencePage}>
      <div className={styles.referencePage_sidebar}>
        <h2 className={styles.referencePage_sidebarTitle}>My Courses</h2>
        <div className={styles.referencePage_courseList}>
          {userCourses.map(course => (
            <button
              key={course.id}
              onClick={() => handleCourseChange(course)}
              className={`${styles.referencePage_courseBtn} ${
                selectedCourse?.id === course.id ? styles.referencePage_courseBtn_active : ''
              }`}
            >
              <div className={styles.referencePage_courseCode}>{course.code}</div>
              <div className={styles.referencePage_courseName}>{course.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.referencePage_content}>
        <ReferenceMaterials
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          isTeacher={isTeacher}
        />
      </div>
    </div>
  );
};

export default ReferencePage;