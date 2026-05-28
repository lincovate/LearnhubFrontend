// src/pages/ReturnedWorkPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReturnedWorkPage.module.css';
import ReturnedWorkList from '../../components/returned-work/ReturnedWorkList';

const ReturnedWorkPage = ({ currentUser }) => {
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    setIsTeacher(!!currentUser?.teacher_profile);
  }, [currentUser]);

  return (
    <div className={styles.returnedWorkPage}>
      <ReturnedWorkList
        currentUser={currentUser}
        isTeacher={isTeacher}
      />
    </div>
  );
};

export default ReturnedWorkPage;