import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import { useAuth } from '../../contexts/AuthContext';
import './ExamsList.css';

const ExamsList = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examsApi.getExams();
      setExams(response.data);
    } catch (err) {
      setError('Failed to load exams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examsApi.deleteExam(examId);
        setExams(exams.filter(exam => exam.id !== examId));
      } catch (err) {
        alert('Failed to delete exam');
      }
    }
  };

  const isTeacher = user?.is_teacher;

  if (loading) return <div className="exams-list exams-list--loading">Loading...</div>;
  if (error) return <div className="exams-list exams-list--error">{error}</div>;

  return (
    <div className="exams-list">
      <div className="exams-list__header">
        <h1 className="exams-list__title">Exams</h1>
        {isTeacher && (
          <Link to="/teacher/exams/create" className="exams-list__btn-create">
            Create New Exam
          </Link>
        )}
      </div>

      {exams.length === 0 ? (
        <p className="exams-list__empty">No exams found.</p>
      ) : (
        <div className="exams-list__grid">
          {exams.map(exam => (
            <div key={exam.id} className="exams-list__card">
              <h3 className="exams-list__card-title">{exam.title}</h3>
              <p className="exams-list__card-course">{exam.course_code} - {exam.course_name}</p>
              <p className="exams-list__card-marks">Total Marks: {exam.total_marks}</p>
              <p className="exams-list__card-time">Time Limit: {exam.time_limit_minutes} min</p>
              <p className="exams-list__card-date">Start: {new Date(exam.start_datetime).toLocaleString()}</p>
              <p className="exams-list__card-date">End: {new Date(exam.end_datetime).toLocaleString()}</p>
              <div className="exams-list__actions">
                {isTeacher ? (
                  <>
                    <Link to={`/teacher/exams/${exam.id}`} className="exams-list__btn-view">View</Link>
                    <Link to={`/teacher/exams/${exam.id}/edit`} className="exams-list__btn-edit">Edit</Link>
                    <button onClick={() => handleDelete(exam.id)} className="exams-list__btn-delete">Delete</button>
                    <Link to={`/teacher/exams/${exam.id}/ranking`} className="exams-list__btn-rank">Ranking</Link>
                  </>
                ) : (
                  <>
                    {exam.is_available && (
                      <Link to={`/student/exam/${exam.id}/take`} className="exams-list__btn-take">Take Exam</Link>
                    )}
                    <Link to={`/student/exam/${exam.id}/result`} className="exams-list__btn-result">My Result</Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsList;