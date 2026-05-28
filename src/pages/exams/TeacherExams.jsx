import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import CreateExam from './CreateExam';
import EditExam from './EditExam';
import ExamRanking from './ExamRanking';
import CourseLeaderboard from './CourseLeaderboard';
import EssayGrading from './EssayGrading';  // import
import './TeacherExams.css';

const TeacherExams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const subPath = location.pathname.replace('/teacher/exams', '') || '/';

  useEffect(() => {
    if (subPath === '/' || subPath === '') {
      loadData();
    }
  }, [subPath]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [coursesRes, examsRes] = await Promise.all([
        examsApi.getMyCourses(),
        examsApi.getExams()
      ]);
      const coursesData = coursesRes.data.results || coursesRes.data || [];
      const examsData = examsRes.data.results || examsRes.data || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (courses.length === 0) {
      alert('You are not assigned to any courses.');
      return;
    }
    navigate('/teacher/exams/create');
  };

  const handleEdit = (examId) => {
    navigate(`/teacher/exams/${examId}/edit`);
  };

  const handleRanking = (examId) => {
    navigate(`/teacher/exams/${examId}/ranking`);
  };

  const handleLeaderboard = () => {
    navigate('/teacher/exams/leaderboard');
  };

  const handleDelete = async (examId) => {
    const confirmed = window.confirm('Delete this exam permanently?');
    if (!confirmed) return;
    try {
      await examsApi.deleteExam(examId);
      setExams(prev => prev.filter(exam => exam.id !== examId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete exam.');
    }
  };

  // ----- Sub‑route rendering -----
  if (subPath.startsWith('/create')) {
    return <CreateExam />;
  }
  if (subPath.match(/^\/\d+\/edit$/)) {
    return <EditExam />;
  }
  if (subPath.match(/^\/\d+\/ranking$/)) {
    return <ExamRanking />;
  }
  if (subPath === '/leaderboard') {
    return <CourseLeaderboard />;
  }
  // New: grade essays
  if (subPath.match(/^\/\d+\/grade-essays$/)) {
    // extract examId from subPath
    const examId = subPath.split('/')[1];
    return <EssayGrading examId={examId} />;
  }

  // ----- Main list view -----
  if (loading) return <div className="teacher-exams">Loading exams...</div>;

  return (
    <div className="teacher-exams">
      <div className="header-actions">
        <h2>Teacher Exams</h2>
        <div className="actions">
          <button className="btn-create" onClick={handleCreate} disabled={courses.length === 0}>
            + Create Exam
          </button>
          <button className="btn-leaderboard" onClick={handleLeaderboard}>
            Course Leaderboard
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {courses.length === 0 && !error && (
        <div className="warning-banner">
          ⚠️ You are not assigned to any courses. Please contact the administrator.
        </div>
      )}

      {exams.length === 0 ? (
        <p>No exams created yet. Click "Create Exam" to get started.</p>
      ) : (
        <table className="exams-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Total Marks</th>
              <th>Time</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.course_name || 'Unknown Course'}</td>
                <td>{exam.total_marks}</td>
                <td>{exam.time_limit_minutes} min</td>
                <td>{exam.is_active ? 'Yes' : 'No'}</td>
                <td className="actions-cell">
                  <button className="btn-edit" onClick={() => handleEdit(exam.id)}>Edit</button>
                  <button className="btn-rank" onClick={() => handleRanking(exam.id)}>Ranking</button>
                  <button className="btn-grade" onClick={() => navigate(`/teacher/exams/${exam.id}/grade-essays`)}>Grade Essays</button>
                  <button className="btn-delete" onClick={() => handleDelete(exam.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherExams;