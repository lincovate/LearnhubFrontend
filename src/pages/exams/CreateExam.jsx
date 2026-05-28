import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import './CreateExam.css';

const CreateExam = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    time_limit_minutes: 60,
    start_datetime: '',
    end_datetime: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await examsApi.getMyCourses();
      const coursesData = res.data.results || res.data || [];
      setCourses(coursesData);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Could not load your courses.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await examsApi.createExam(formData);
      navigate(`/teacher/exams/${response.data.id}/edit?new=true`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam">
      <h1 className="create-exam__title">Create New Exam</h1>
      <form onSubmit={handleSubmit} className="create-exam__form">
        <div className="create-exam__field">
          <label className="create-exam__label">Course *</label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="create-exam__select"
            required
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div className="create-exam__field">
          <label className="create-exam__label">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="create-exam__input"
            required
          />
        </div>

        <div className="create-exam__field">
          <label className="create-exam__label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="create-exam__textarea"
          />
        </div>

        <div className="create-exam__field">
          <label className="create-exam__label">Time Limit (minutes) *</label>
          <input
            type="number"
            name="time_limit_minutes"
            value={formData.time_limit_minutes}
            onChange={handleChange}
            min="1"
            className="create-exam__input"
            required
          />
        </div>

        <div className="create-exam__row">
          <div className="create-exam__field">
            <label className="create-exam__label">Start Date & Time *</label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={formData.start_datetime}
              onChange={handleChange}
              className="create-exam__input"
              required
            />
          </div>
          <div className="create-exam__field">
            <label className="create-exam__label">End Date & Time *</label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={formData.end_datetime}
              onChange={handleChange}
              className="create-exam__input"
              required
            />
          </div>
        </div>

        <div className="create-exam__field create-exam__field--checkbox">
          <label className="create-exam__checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="create-exam__checkbox"
            />
            Active (visible to students)
          </label>
        </div>

        {error && <div className="create-exam__error">{error}</div>}
        <button type="submit" disabled={loading} className="create-exam__submit">
          {loading ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
    </div>
  );
};

export default CreateExam;