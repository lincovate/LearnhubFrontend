// src/components/reference/SyllabusViewer.jsx
import React, { useState, useEffect } from 'react';
import styles from './SyllabusViewer.module.css';
import { referenceApi } from '../../api/reference';

const SyllabusViewer = ({ courseId, courseName, isTeacher = false }) => {
  const [syllabus, setSyllabus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    week_by_week_breakdown: '',
    assessment_criteria: '',
    required_textbooks: '',
    recommended_readings: '',
    file: null
  });

  useEffect(() => {
    loadSyllabus();
  }, [courseId]);

  const loadSyllabus = async () => {
    setIsLoading(true);
    try {
      const response = await referenceApi.getCurrentSyllabus(courseId);
      setSyllabus(response.data);
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        week_by_week_breakdown: response.data.week_by_week_breakdown || '',
        assessment_criteria: response.data.assessment_criteria || '',
        required_textbooks: response.data.required_textbooks || '',
        recommended_readings: response.data.recommended_readings || '',
        file: null
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to load syllabus:', error);
      }
      setSyllabus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSyllabus = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('course', courseId);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('week_by_week_breakdown', formData.week_by_week_breakdown);
      submitData.append('assessment_criteria', formData.assessment_criteria);
      submitData.append('required_textbooks', formData.required_textbooks);
      submitData.append('recommended_readings', formData.recommended_readings);
      if (formData.file) {
        submitData.append('file', formData.file);
      }
      
      let response;
      if (syllabus) {
        response = await referenceApi.updateSyllabus(syllabus.id, submitData);
      } else {
        response = await referenceApi.createSyllabus(submitData);
      }
      
      setSyllabus(response.data);
      setIsEditing(false);
      alert('Syllabus saved successfully!');
    } catch (error) {
      console.error('Failed to save syllabus:', error);
      alert('Failed to save syllabus. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSyllabus = async () => {
    if (syllabus?.file) {
      try {
        const { default: api } = await import('../../api/client');
        await api.triggerDownload(syllabus.file);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const formatText = (text) => {
    if (!text) return 'Not specified';
    return text.split('\n').map((line, i) => (
      <p key={i} className={styles.syllabusViewer_paragraph}>{line}</p>
    ));
  };

  if (isLoading) {
    return (
      <div className={styles.syllabusViewer_loading}>
        <div className={styles.syllabusViewer_spinner}></div>
        <p>Loading syllabus...</p>
      </div>
    );
  }

  if (isEditing && isTeacher) {
    return (
      <div className={styles.syllabusViewer}>
        <div className={styles.syllabusViewer_header}>
          <h2 className={styles.syllabusViewer_title}>
            {syllabus ? 'Edit Syllabus' : 'Create Syllabus'} - {courseName}
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className={styles.syllabusViewer_cancelBtn}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSaveSyllabus} className={styles.syllabusViewer_form}>
          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Syllabus Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={styles.syllabusViewer_input}
              required
            />
          </div>

          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Course Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={styles.syllabusViewer_textarea}
              rows={4}
              placeholder="Course overview, objectives, and learning outcomes..."
            />
          </div>

          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Week-by-Week Breakdown</label>
            <textarea
              value={formData.week_by_week_breakdown}
              onChange={(e) => setFormData({...formData, week_by_week_breakdown: e.target.value})}
              className={styles.syllabusViewer_textarea}
              rows={6}
              placeholder="Week 1: Introduction&#10;Week 2: Topic 1&#10;Week 3: Topic 2..."
            />
          </div>

          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Assessment Criteria</label>
            <textarea
              value={formData.assessment_criteria}
              onChange={(e) => setFormData({...formData, assessment_criteria: e.target.value})}
              className={styles.syllabusViewer_textarea}
              rows={4}
              placeholder="Assignments: 30%&#10;Mid-term Exam: 30%&#10;Final Exam: 40%"
            />
          </div>

          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Required Textbooks</label>
            <textarea
              value={formData.required_textbooks}
              onChange={(e) => setFormData({...formData, required_textbooks: e.target.value})}
              className={styles.syllabusViewer_textarea}
              rows={3}
              placeholder="1. Book Title by Author&#10;2. Book Title by Author"
            />
          </div>

          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Recommended Readings</label>
            <textarea
              value={formData.recommended_readings}
              onChange={(e) => setFormData({...formData, recommended_readings: e.target.value})}
              className={styles.syllabusViewer_textarea}
              rows={3}
              placeholder="Additional resources and readings..."
            />
          </div>

          <div className={styles.syllabusViewer_formGroup}>
            <label className={styles.syllabusViewer_label}>Upload PDF (Optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              className={styles.syllabusViewer_fileInput}
            />
          </div>

          <button type="submit" className={styles.syllabusViewer_submitBtn}>
            Save Syllabus
          </button>
        </form>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className={styles.syllabusViewer}>
        <div className={styles.syllabusViewer_empty}>
          <svg className={styles.syllabusViewer_emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={styles.syllabusViewer_emptyText}>No syllabus available yet</p>
          {isTeacher && (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.syllabusViewer_createBtn}
            >
              Create Syllabus
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.syllabusViewer}>
      <div className={styles.syllabusViewer_header}>
        <div>
          <h2 className={styles.syllabusViewer_title}>{syllabus.title}</h2>
          <p className={styles.syllabusViewer_version}>Version {syllabus.version}</p>
        </div>
        <div className={styles.syllabusViewer_actions}>
          {syllabus.file && (
            <button
              onClick={handleDownloadSyllabus}
              className={styles.syllabusViewer_downloadBtn}
            >
              <svg className={styles.syllabusViewer_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Download PDF
            </button>
          )}
          {isTeacher && (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.syllabusViewer_editBtn}
            >
              Edit Syllabus
            </button>
          )}
        </div>
      </div>

      <div className={styles.syllabusViewer_tabs}>
        <button
          className={`${styles.syllabusViewer_tab} ${activeTab === 'overview' ? styles.syllabusViewer_tab_active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.syllabusViewer_tab} ${activeTab === 'schedule' ? styles.syllabusViewer_tab_active : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Weekly Schedule
        </button>
        <button
          className={`${styles.syllabusViewer_tab} ${activeTab === 'assessment' ? styles.syllabusViewer_tab_active : ''}`}
          onClick={() => setActiveTab('assessment')}
        >
          Assessment
        </button>
        <button
          className={`${styles.syllabusViewer_tab} ${activeTab === 'resources' ? styles.syllabusViewer_tab_active : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
      </div>

      <div className={styles.syllabusViewer_content}>
        {activeTab === 'overview' && (
          <div>
            <h3 className={styles.syllabusViewer_sectionTitle}>Course Description</h3>
            {formatText(syllabus.description)}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <h3 className={styles.syllabusViewer_sectionTitle}>Weekly Schedule</h3>
            {formatText(syllabus.week_by_week_breakdown)}
          </div>
        )}

        {activeTab === 'assessment' && (
          <div>
            <h3 className={styles.syllabusViewer_sectionTitle}>Assessment Criteria</h3>
            {formatText(syllabus.assessment_criteria)}
          </div>
        )}

        {activeTab === 'resources' && (
          <div>
            <div className={styles.syllabusViewer_section}>
              <h3 className={styles.syllabusViewer_sectionTitle}>Required Textbooks</h3>
              {formatText(syllabus.required_textbooks)}
            </div>
            <div className={styles.syllabusViewer_section}>
              <h3 className={styles.syllabusViewer_sectionTitle}>Recommended Readings</h3>
              {formatText(syllabus.recommended_readings)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusViewer;