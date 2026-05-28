// src/components/reference/ReferenceMaterials.jsx
import React, { useState, useEffect } from 'react';
import styles from './ReferenceMaterials.module.css';
import MaterialCard from './MaterialCard';
import SyllabusViewer from './SyllabusViewer';
import { referenceApi } from '../../api/reference';

const ReferenceMaterials = ({ courseId, courseName, isTeacher = false }) => {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('materials');
  const [formData, setFormData] = useState({
    title: '',
    material_type: 'notes',
    category: '',
    description: '',
    file: null,
    external_url: '',
    author: '',
    edition: '',
    publisher: '',
    year_published: ''
  });

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [materialsRes, categoriesRes] = await Promise.all([
        referenceApi.getMaterials({ courseId }),
        referenceApi.getCategories(courseId)
      ]);
      setMaterials(materialsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load reference materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      await referenceApi.deleteMaterial(materialId);
      setMaterials(materials.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material');
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('course', courseId);
      submitData.append('title', formData.title);
      submitData.append('material_type', formData.material_type);
      if (formData.category) submitData.append('category', formData.category);
      if (formData.description) submitData.append('description', formData.description);
      if (formData.file) submitData.append('file', formData.file);
      if (formData.external_url) submitData.append('external_url', formData.external_url);
      if (formData.author) submitData.append('author', formData.author);
      if (formData.edition) submitData.append('edition', formData.edition);
      if (formData.publisher) submitData.append('publisher', formData.publisher);
      if (formData.year_published) submitData.append('year_published', formData.year_published);
      
      const response = await referenceApi.createMaterial(submitData);
      setMaterials([response.data, ...materials]);
      setShowUploadForm(false);
      setFormData({
        title: '',
        material_type: 'notes',
        category: '',
        description: '',
        file: null,
        external_url: '',
        author: '',
        edition: '',
        publisher: '',
        year_published: ''
      });
      alert('Material uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload material:', error);
      alert('Failed to upload material. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    if (selectedType !== 'all' && material.material_type !== selectedType) return false;
    if (selectedCategory !== 'all' && material.category !== parseInt(selectedCategory)) return false;
    return true;
  });

  const materialTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'book', label: 'Books' },
    { value: 'notes', label: 'Lecture Notes' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'past_paper', label: 'Past Papers' },
    { value: 'handout', label: 'Handouts' },
    { value: 'video', label: 'Videos' },
    { value: 'link', label: 'Links' }
  ];

  if (isLoading && materials.length === 0) {
    return (
      <div className={styles.referenceMaterials_loading}>
        <div className={styles.referenceMaterials_spinner}></div>
        <p>Loading materials...</p>
      </div>
    );
  }

  return (
    <div className={styles.referenceMaterials}>
      <div className={styles.referenceMaterials_tabs}>
        <button
          className={`${styles.referenceMaterials_tab} ${activeTab === 'materials' ? styles.referenceMaterials_tab_active : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Study Materials
        </button>
        <button
          className={`${styles.referenceMaterials_tab} ${activeTab === 'syllabus' ? styles.referenceMaterials_tab_active : ''}`}
          onClick={() => setActiveTab('syllabus')}
        >
          Course Syllabus
        </button>
      </div>

      {activeTab === 'syllabus' ? (
        <SyllabusViewer
          courseId={courseId}
          courseName={courseName}
          isTeacher={isTeacher}
        />
      ) : (
        <>
          <div className={styles.referenceMaterials_header}>
            <div className={styles.referenceMaterials_filters}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={styles.referenceMaterials_filterSelect}
              >
                {materialTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.referenceMaterials_filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {isTeacher && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className={styles.referenceMaterials_uploadBtn}
              >
                <svg className={styles.referenceMaterials_uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Material
              </button>
            )}
          </div>

          {showUploadForm && (
            <div className={styles.referenceMaterials_uploadForm}>
              <h3 className={styles.referenceMaterials_formTitle}>Upload New Material</h3>
              <form onSubmit={handleUploadMaterial}>
                <div className={styles.referenceMaterials_formRow}>
                  <div className={styles.referenceMaterials_formGroup}>
                    <label className={styles.referenceMaterials_label}>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className={styles.referenceMaterials_input}
                      required
                    />
                  </div>
                  
                  <div className={styles.referenceMaterials_formGroup}>
                    <label className={styles.referenceMaterials_label}>Material Type *</label>
                    <select
                      value={formData.material_type}
                      onChange={(e) => setFormData({...formData, material_type: e.target.value})}
                      className={styles.referenceMaterials_select}
                      required
                    >
                      {materialTypes.filter(t => t.value !== 'all').map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.referenceMaterials_formRow}>
                  <div className={styles.referenceMaterials_formGroup}>
                    <label className={styles.referenceMaterials_label}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className={styles.referenceMaterials_select}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={styles.referenceMaterials_formGroup}>
                    <label className={styles.referenceMaterials_label}>Author</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className={styles.referenceMaterials_input}
                    />
                  </div>
                </div>

                <div className={styles.referenceMaterials_formRow}>
                  <div className={styles.referenceMaterials_formGroup}>
                    <label className={styles.referenceMaterials_label}>Publisher</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                      className={styles.referenceMaterials_input}
                    />
                  </div>
                  
                  <div className={styles.referenceMaterials_formGroup}>
                    <label className={styles.referenceMaterials_label}>Year Published</label>
                    <input
                      type="number"
                      value={formData.year_published}
                      onChange={(e) => setFormData({...formData, year_published: e.target.value})}
                      className={styles.referenceMaterials_input}
                    />
                  </div>
                </div>

                <div className={styles.referenceMaterials_formGroup}>
                  <label className={styles.referenceMaterials_label}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className={styles.referenceMaterials_textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.referenceMaterials_formGroup}>
                  <label className={styles.referenceMaterials_label}>File Upload (PDF, DOC, PPT, ZIP)</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                    className={styles.referenceMaterials_fileInput}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                  />
                </div>

                <div className={styles.referenceMaterials_formGroup}>
                  <label className={styles.referenceMaterials_label}>OR External URL</label>
                  <input
                    type="url"
                    value={formData.external_url}
                    onChange={(e) => setFormData({...formData, external_url: e.target.value})}
                    className={styles.referenceMaterials_input}
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.referenceMaterials_formActions}>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className={styles.referenceMaterials_cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.referenceMaterials_submitBtn}>
                    Upload Material
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.referenceMaterials_list}>
            {filteredMaterials.length === 0 ? (
              <div className={styles.referenceMaterials_empty}>
                <svg className={styles.referenceMaterials_emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No materials found</p>
                {isTeacher && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className={styles.referenceMaterials_emptyBtn}
                  >
                    Upload your first material
                  </button>
                )}
              </div>
            ) : (
              filteredMaterials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onDelete={handleDeleteMaterial}
                  isTeacher={isTeacher}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReferenceMaterials;