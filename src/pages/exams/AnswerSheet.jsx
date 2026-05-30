import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';   // named import
import './AnswerSheet.css';

const AnswerSheet = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    examsApi.getAnswerSheet(attemptId)
      .then(res => {
        setSheet(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to load answer sheet');
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) return <div className="AnswerSheet-container container">Loading...</div>;
  if (error) return <div className="AnswerSheet-container container error">{error}</div>;

  return (
    <div className="AnswerSheet-container container">
      <div className="AnswerSheet-card card">
        <h1 className="AnswerSheet-title">Graded Answer Sheet</h1>
        <div className="AnswerSheet-info">
          <p><strong>Exam:</strong> {sheet.exam_title}</p>
          <p><strong>Course:</strong> {sheet.course_name}</p>
          <p><strong>Student:</strong> {sheet.student_name} ({sheet.student_reg_number})</p>
          <p><strong>Score:</strong> {sheet.score_obtained}/{sheet.total_marks} ({sheet.percentage}%)</p>
          <p><strong>Result:</strong> {sheet.is_passed ? 'Passed' : 'Failed'}</p>
          <p><strong>Status:</strong> {sheet.status}</p>
        </div>
        <h2 className="AnswerSheet-subtitle">Detailed Answers</h2>
        <div className="AnswerSheet-questions">
          {sheet.questions.map((q, idx) => (
            <div key={q.question_id} className={`AnswerSheet-questionCard ${q.is_correct ? 'correct' : 'incorrect'}`}>
              <div className="AnswerSheet-questionHeader">
                <span className="AnswerSheet-questionNumber">Q{idx+1}</span>
                <span className="AnswerSheet-questionText">{q.question_text}</span>
                <span className="AnswerSheet-marks">({q.marks} marks)</span>
              </div>
              <div className="AnswerSheet-answerRow">
                <div className="AnswerSheet-studentAnswer">
                  Your answer: <strong className={q.is_correct ? 'text-correct' : 'text-incorrect'}>
                    {q.student_answer || '(Not answered)'}
                  </strong>
                </div>
                {q.correct_answer && !q.is_correct && (
                  <div className="AnswerSheet-correctAnswer">
                    Correct answer: {q.correct_answer}
                  </div>
                )}
                <div className="AnswerSheet-marksAwarded">
                  Marks awarded: {q.marks_awarded}/{q.marks}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="AnswerSheet-backBtn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default AnswerSheet;