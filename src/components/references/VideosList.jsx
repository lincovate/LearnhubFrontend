// src/components/references/VideosList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referencesApi } from '../../api/references';
import { api } from '../../api/client';
import styles from './VideosList.module.css';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return url;
  if (url.includes('youtu.be')) {
    const videoId = url.split('/').pop().split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
};

const VideosList = ({ isTeacher: propIsTeacher }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(propIsTeacher || false);
  const [showUpload, setShowUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchVideos();
    if (propIsTeacher === undefined) {
      checkUserRole();
    } else if (propIsTeacher) {
      fetchTeacherCourses();
    }
  }, [propIsTeacher]);

  const fetchVideos = async () => {
    try {
      const res = await referencesApi.getVideos();
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const profile = await api.getProfile();
      const teacher = !!profile.data.teacher_profile;
      setIsTeacher(teacher);
      if (teacher) {
        const coursesRes = await api.getMyCourses();
        setCourses(coursesRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const coursesRes = await api.getMyCourses();
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (data) => {
    await referencesApi.createVideo(data);
    setShowUpload(false);
    fetchVideos();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this video?')) {
      await referencesApi.deleteVideo(id);
      fetchVideos();
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowEditModal(true);
  };

  const handleUpdate = async (data) => {
    await referencesApi.updateVideo(editingVideo.id, data);
    setShowEditModal(false);
    setEditingVideo(null);
    fetchVideos();
  };

  const openFullScreen = (video) => {
    navigate(`/videos/view/${video.id}`, { state: { video } });
  };

  if (loading) return <div className={styles.VideosList_loading}>Loading videos...</div>;

  return (
    <div className={styles.VideosList_container}>
      <div className={styles.VideosList_header}>
        <h2 className={styles.VideosList_title}>Videos</h2>
        <div className={styles.VideosList_headerActions}>
          <div className={styles.VideosList_viewToggle}>
            <button
              className={`${styles.VideosList_viewButton} ${viewMode === 'grid' ? styles.VideosList_activeView : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`${styles.VideosList_viewButton} ${viewMode === 'tile' ? styles.VideosList_activeView : ''}`}
              onClick={() => setViewMode('tile')}
              title="Tile view"
            >
              ☰ Tile
            </button>
          </div>
          {isTeacher && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className={styles.VideosList_uploadButton}
            >
              {showUpload ? 'Cancel' : 'Add Video'}
            </button>
          )}
        </div>
      </div>

      {isTeacher && showUpload && (
        <VideoUploadForm
          courses={courses}
          onUpload={handleUpload}
          onCancel={() => setShowUpload(false)}
        />
      )}

      <div className={`${styles.VideosList_grid} ${viewMode === 'tile' ? styles.VideosList_tileView : ''}`}>
        {videos.map((video) => (
          <div
            key={video.id}
            className={`${styles.VideosList_card} ${viewMode === 'tile' ? styles.VideosList_tileCard : ''}`}
            onClick={() => openFullScreen(video)}
          >
            <div className={styles.VideosList_thumbnailWrapper}>
              <img
                src={`https://img.youtube.com/vi/${video.embed_url.split('/embed/')[1]}/0.jpg`}
                alt={video.title}
                className={styles.VideosList_thumbnail}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail'; }}
              />
            </div>
            <div className={styles.VideosList_cardContent}>
              <h3 className={styles.VideosList_cardTitle}>{video.title}</h3>
              <div className={styles.VideosList_watchButton}>
                ▶ Click to watch
              </div>
              {isTeacher && (
                <div
                  className={styles.VideosList_actionButtons}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(video)}
                    className={styles.VideosList_editButton}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className={styles.VideosList_deleteButton}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showEditModal && editingVideo && (
        <VideoEditModal
          video={editingVideo}
          courses={courses}
          onUpdate={handleUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

// Video Upload Form (JSON) – unchanged
const VideoUploadForm = ({ courses, onUpload, onCancel }) => {
  // same as before
};

// Edit Modal Component (JSON) – unchanged
const VideoEditModal = ({ video, courses, onUpdate, onClose }) => {
  // same as before
};

export default VideosList;