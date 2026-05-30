import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import './ExamResult.css';

const ExamResult = ({ id }) => {
  const navigate = useNavigate();  // ✅ import and use
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadResult();
  }, [id]);

  const loadResult = async () => {
    try {
      const response = await examsApi.getExamResults(id);
      const myResults = response.data.filter(r => r.exam === parseInt(id));
      if (myResults.length > 0) setResult(myResults[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="exam-result exam-result--loading">Loading...</div>;
  if (!result) return <div className="exam-result exam-result--empty">No result found for this exam.</div>;

  return (
    <div className="exam-result">
      <h1 className="exam-result__title">Exam Result</h1>
      <div className="exam-result__card">
        <div className="exam-result__row">
          <span className="exam-result__label">Exam:</span>
          <span className="exam-result__value">{result.exam_title}</span>
        </div>
        <div className="exam-result__row">
          <span className="exam-result__label">Course:</span>
          <span className="exam-result__value">{result.course_name}</span>
        </div>
        <div className="exam-result__row">
          <span className="exam-result__label">Score:</span>
          <span className="exam-result__value">{result.score_obtained} / {result.total_marks}</span>
        </div>
        <div className="exam-result__row">
          <span className="exam-result__label">Percentage:</span>
          <span className="exam-result__value">{result.percentage.toFixed(2)}%</span>
        </div>
        <div className="exam-result__row">
          <span className="exam-result__label">Status:</span>
          <span className={`exam-result__status exam-result__status--${result.is_passed ? 'passed' : 'failed'}`}>
            {result.is_passed ? '✅ Passed' : '❌ Failed'}
          </span>
        </div>
        <div className="exam-result__row">
          <span className="exam-result__label">Submitted:</span>
          <span className="exam-result__value">{new Date(result.end_time).toLocaleString()}</span>
        </div>
        <button 
          onClick={() => navigate(`/answer-sheet/${result.id}`)}  // ✅ use result.id
          className="btn-secondary"
        >
          View Answer Sheet
        </button>
      </div>
      <Link to="/student/exams" className="exam-result__back-btn">← Back to Exams</Link>
    </div>
  );
};

export default ExamResult;