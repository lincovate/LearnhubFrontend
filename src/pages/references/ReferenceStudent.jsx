import React, { useState } from 'react';
import BooksList from '../../components/references/BooksList';
import VideosList from '../../components/references/VideosList';
import SyllabusList from '../../components/references/SyllabusList';
import NotesList from '../../components/references/NotesList';
import styles from './ReferenceStudent.module.css';

const ReferenceStudent = () => {
  const [activeTab, setActiveTab] = useState('books');

  const tabs = [
    { id: 'books', name: 'Books', component: <BooksList isTeacher={false} /> },
    { id: 'videos', name: 'Videos', component: <VideosList isTeacher={false} /> },
    { id: 'syllabus', name: 'Syllabus', component: <SyllabusList isTeacher={false} /> },
    { id: 'notes', name: 'Notes', component: <NotesList isTeacher={false} /> },
  ];

  return (
    <div className={styles.ReferenceStudent_container}>
      <h1 className={styles.ReferenceStudent_title}>Learning Resources</h1>
      <div className={styles.ReferenceStudent_tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.ReferenceStudent_tabButton} ${activeTab === tab.id ? styles.ReferenceStudent_activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className={styles.ReferenceStudent_content}>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default ReferenceStudent;