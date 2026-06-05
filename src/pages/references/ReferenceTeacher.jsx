import React, { useState } from 'react';
import BooksList from '../../components/references/BooksList';
import VideosList from '../../components/references/VideosList';
import SyllabusList from '../../components/references/SyllabusList';
import NotesList from '../../components/references/NotesList';
import styles from './ReferenceTeacher.module.css';

const ReferenceTeacher = () => {
  const [activeTab, setActiveTab] = useState('books');

  const tabs = [
    { id: 'books', name: 'Books', component: <BooksList isTeacher={true} /> },
    { id: 'videos', name: 'Videos', component: <VideosList isTeacher={true} /> },
    { id: 'syllabus', name: 'Syllabus', component: <SyllabusList isTeacher={true} /> },
    { id: 'notes', name: 'Notes', component: <NotesList isTeacher={true} /> },
  ];

  return (
    <div className={styles.ReferenceTeacher_container}>
      <h1 className={styles.ReferenceTeacher_title}>Manage Learning Resources</h1>
      <div className={styles.ReferenceTeacher_tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.ReferenceTeacher_tabButton} ${activeTab === tab.id ? styles.ReferenceTeacher_activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div className={styles.ReferenceTeacher_content}>
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default ReferenceTeacher;