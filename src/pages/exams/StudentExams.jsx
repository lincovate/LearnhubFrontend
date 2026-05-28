import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import StudentCourseLeaderboard from './StudentCourseLeaderboard';
import './StudentExams.css';

const StudentExams = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('not_started');
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timers, setTimers] = useState({});

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Timer for in‑progress exams – depends on exams and attempts
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimers();
    }, 1000);
    return () => clearInterval(interval);
  }, [attempts, exams]);

  const updateTimers = () => {
    const newTimers = {};
    attempts.forEach(attempt => {
      if (attempt.status === 'IN_PROGRESS' && attempt.start_time) {
        const exam = exams.find(e => e.id === attempt.exam);
        if (exam) {
          const remaining = examsApi.getTimeRemaining(attempt.start_time, exam.time_limit_minutes);
          if (!remaining.expired) {
            newTimers[attempt.exam] = `${remaining.minutes}:${remaining.seconds < 10 ? '0' + remaining.seconds : remaining.seconds}`;
          } else {
            newTimers[attempt.exam] = 'Expired';
          }
        }
      }
    });
    setTimers(newTimers);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examsRes, attemptsRes, resultsRes] = await Promise.all([
        examsApi.getExams(),
        examsApi.getAttempts(),
        examsApi.getExamResults()
      ]);
      const examsData = examsRes.data.results || examsRes.data || [];
      const attemptsData = attemptsRes.data.results || attemptsRes.data || [];
      const resultsData = resultsRes.data.results || resultsRes.data || [];
      setExams(examsData);
      setAttempts(attemptsData);
      setResults(resultsData);
      updateTimers(); // initial timer calculation
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeExam = (examId) => {
    navigate(`/student/exams/take/${examId}`);
  };

  const handleContinueExam = (examId) => {
    navigate(`/student/exams/take/${examId}`);
  };

  const handleViewResult = (examId) => {
    navigate(`/student/exams/result/${examId}`);
  };

  // Categorize exams
  const notStartedExams = exams.filter(exam => {
    const hasAttempt = attempts.some(a => a.exam === exam.id);
    const hasResult = results.some(r => r.exam === exam.id);
    return !hasAttempt && !hasResult;
  });

  const inProgressExams = exams.filter(exam => {
    const attempt = attempts.find(a => a.exam === exam.id);
    return attempt && attempt.status === 'IN_PROGRESS';
  });

  const completedExams = exams.filter(exam => {
    return results.some(r => r.exam === exam.id);
  });

  if (loading) return <div className="student-exams">Loading exams...</div>;

  return (
    <div className="student-exams">
      <div className="student-exams-header">
        <h2>My Exams</h2>
        <button onClick={loadData} className="refresh-btn">⟳ Refresh</button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Tab navigation */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'not_started' ? 'active' : ''}`}
          onClick={() => setActiveTab('not_started')}
        >
          📅 Not Started ({notStartedExams.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in_progress')}
        >
          ⏳ In Progress ({inProgressExams.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({completedExams.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Course Leaderboard
        </button>
      </div>

      {/* Not Started Tab */}
      {activeTab === 'not_started' && (
        <div className="tab-content">
          {notStartedExams.length === 0 ? (
            <p className="empty-message">No upcoming exams.</p>
          ) : (
            <div className="exams-list">
              {notStartedExams.map(exam => (
                <div key={exam.id} className="exam-item">
                  <div className="exam-info">
                    <h3>{exam.title}</h3>
                    <p>{exam.course_name || 'Unknown Course'}</p>
                    <p>Duration: {exam.time_limit_minutes} min</p>
                    <p>Total Marks: {exam.total_marks}</p>
                    {exam.start_datetime && (
                      <p>Opens: {new Date(exam.start_datetime).toLocaleString()}</p>
                    )}
                    {exam.end_datetime && (
                      <p>Closes: {new Date(exam.end_datetime).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="exam-actions">
                    <button className="btn-take" onClick={() => handleTakeExam(exam.id)}>
                      Start Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In Progress Tab */}
      {activeTab === 'in_progress' && (
        <div className="tab-content">
          {inProgressExams.length === 0 ? (
            <p className="empty-message">No exams in progress.</p>
          ) : (
            <div className="exams-list">
              {inProgressExams.map(exam => {
                const attempt = attempts.find(a => a.exam === exam.id);
                return (
                  <div key={exam.id} className="exam-item">
                    <div className="exam-info">
                      <h3>{exam.title}</h3>
                      <p>{exam.course_name || 'Unknown Course'}</p>
                      <p>Time Remaining: <span className="timer-display">{timers[exam.id] || 'Calculating...'}</span></p>
                      <p>Started: {attempt ? new Date(attempt.start_time).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="exam-actions">
                      <button className="btn-continue" onClick={() => handleContinueExam(exam.id)}>
                        Continue Exam
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === 'completed' && (
        <div className="tab-content">
          {completedExams.length === 0 ? (
            <p className="empty-message">No completed exams yet.</p>
          ) : (
            <div className="exams-list">
              {completedExams.map(exam => {
                const result = results.find(r => r.exam === exam.id);
                const attempt = attempts.find(a => a.exam === exam.id);
                return (
                  <div key={exam.id} className="exam-item">
                    <div className="exam-info">
                      <h3>{exam.title}</h3>
                      <p>{exam.course_name || 'Unknown Course'}</p>
                      <p>Score: {result?.score_obtained || 0} / {exam.total_marks}</p>
                      <p>Percentage: {result?.percentage?.toFixed(2) || 0}%</p>
                      <p>Status: {result?.is_passed ? 'Passed' : 'Failed'}</p>
                      {attempt?.start_time && <p>Taken: {new Date(attempt.start_time).toLocaleString()}</p>}
                      {result?.end_time && <p>Submitted: {new Date(result.end_time).toLocaleString()}</p>}
                    </div>
                    <div className="exam-actions">
                      <button className="btn-result" onClick={() => handleViewResult(exam.id)}>
                        View Result
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="tab-content leaderboard-tab">
          <StudentCourseLeaderboard />
        </div>
      )}
    </div>
  );
};

export default StudentExams;