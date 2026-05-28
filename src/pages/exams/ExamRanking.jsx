import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import { useAuth } from '../../contexts/AuthContext';
import './ExamRanking.css';

const ExamRanking = ({ id }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No exam ID provided');
      setLoading(false);
      return;
    }
    loadRanking();
  }, [id]);

  const loadRanking = async () => {
    try {
      const response = await examsApi.getExamRanking(id);
      setRankingData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load ranking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="exam-ranking exam-ranking--loading">Loading...</div>;
  if (error) return <div className="exam-ranking exam-ranking--error">{error}</div>;
  if (!rankingData) return <div className="exam-ranking exam-ranking--empty">No ranking data available.</div>;

  const isTeacher = user?.is_teacher;

  return (
    <div className="exam-ranking">
      <h1 className="exam-ranking__title">{rankingData.exam_title} - Ranking</h1>
      <p className="exam-ranking__participants">Total Participants: {rankingData.total_participants}</p>

      {!isTeacher && rankingData.top_10 && (
        <>
          <h2 className="exam-ranking__subtitle">🏆 Top 10</h2>
          <div className="exam-ranking__table-wrapper">
            <table className="exam-ranking__table">
              <thead>
                <tr>
                  <th className="exam-ranking__th">Rank</th>
                  <th className="exam-ranking__th">Student</th>
                  <th className="exam-ranking__th">Reg No</th>
                  <th className="exam-ranking__th">Score</th>
                  <th className="exam-ranking__th">%</th>
                </tr>
              </thead>
              <tbody>
                {rankingData.top_10.map(entry => (
                  <tr key={entry.student_id} className="exam-ranking__tr">
                    <td className="exam-ranking__td">{entry.rank}</td>
                    <td className="exam-ranking__td">{entry.student_name}</td>
                    <td className="exam-ranking__td">{entry.registration_number}</td>
                    <td className="exam-ranking__td">{entry.score_obtained}/{entry.total_marks}</td>
                    <td className="exam-ranking__td">{entry.percentage.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rankingData.my_rank && (
            <div className="exam-ranking__my-rank">
              <h3 className="exam-ranking__my-rank-title">Your Rank: {rankingData.my_rank}</h3>
              <p className="exam-ranking__my-rank-score">Your Score: {rankingData.my_score}/{rankingData.total_marks} ({rankingData.my_percentage?.toFixed(2)}%)</p>
            </div>
          )}
        </>
      )}

      {isTeacher && rankingData.ranking && (
        <div className="exam-ranking__table-wrapper">
          <table className="exam-ranking__table exam-ranking__table--full">
            <thead>
              <tr>
                <th className="exam-ranking__th">Rank</th>
                <th className="exam-ranking__th">Student</th>
                <th className="exam-ranking__th">Reg No</th>
                <th className="exam-ranking__th">Score</th>
                <th className="exam-ranking__th">%</th>
                <th className="exam-ranking__th">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.ranking.map(entry => (
                <tr key={entry.student_id} className="exam-ranking__tr">
                  <td className="exam-ranking__td">{entry.rank}</td>
                  <td className="exam-ranking__td">{entry.student_name}</td>
                  <td className="exam-ranking__td">{entry.registration_number}</td>
                  <td className="exam-ranking__td">{entry.score_obtained}/{entry.total_marks}</td>
                  <td className="exam-ranking__td">{entry.percentage.toFixed(2)}%</td>
                  <td className="exam-ranking__td">{new Date(entry.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={() => navigate('/teacher/exams')} className="exam-ranking__back-btn">
        ← Back to Exams
      </button>
    </div>
  );
};

export default ExamRanking;