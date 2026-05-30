import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import './EssayGrading.css';

const EssayGrading = ({ examId: propExamId }) => {
  const { examId: paramExamId } = useParams();
  const examId = propExamId || paramExamId;
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [essayAnswers, setEssayAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingStatus, setGradingStatus] = useState({});

  useEffect(() => {
    if (examId) {
      loadData();
    } else {
      setError('No exam ID provided');
      setLoading(false);
    }
  }, [examId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examRes, answersRes] = await Promise.all([
        examsApi.getExam(examId),
        examsApi.getStudentAnswers(),
      ]);
      setExam(examRes.data);

      // All answers from the API (may be paginated)
      const allAnswers = answersRes.data.results || answersRes.data || [];
      // Filter using the new fields from the serializer
      const filtered = allAnswers.filter(ans => {
        return ans.question_exam_id === parseInt(examId) && ans.question_type === 'ESS';
      });
      setEssayAnswers(filtered);
    } catch (err) {
      console.error(err);
      setError('Failed to load essay answers');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (answerId, marksAwarded) => {
    if (marksAwarded === undefined || marksAwarded === '') {
      alert('Please enter marks');
      return;
    }
    const marks = Number(marksAwarded);
    if (isNaN(marks) || marks < 0) {
      alert('Please enter a valid number');
      return;
    }
    setGradingStatus(prev => ({ ...prev, [answerId]: 'saving' }));
    try {
      await examsApi.gradeEssay(answerId, marks);
      // Update local state
      setEssayAnswers(prev =>
        prev.map(ans =>
          ans.id === answerId ? { ...ans, marks_awarded: marks } : ans
        )
      );
      setGradingStatus(prev => ({ ...prev, [answerId]: 'saved' }));
      setTimeout(() => {
        setGradingStatus(prev => ({ ...prev, [answerId]: null }));
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Grading failed');
      setGradingStatus(prev => ({ ...prev, [answerId]: null }));
    }
  };

  if (loading) return <div className="essay-grading essay-grading--loading">Loading...</div>;
  if (error) return <div className="essay-grading essay-grading--error">{error}</div>;
  if (!exam) return <div className="essay-grading essay-grading--empty">No exam found</div>;

  return (
    <div className="essay-grading">
      <div className="essay-grading__header">
        <h1 className="essay-grading__title">Grade Essays: {exam.title}</h1>
        <button className="essay-grading__back-btn" onClick={() => navigate('/teacher/exams')}>
          ← Back to Exams
        </button>
      </div>

      {essayAnswers.length === 0 ? (
        <p className="essay-grading__empty-message">No essay submissions for this exam.</p>
      ) : (
        <div className="essay-grading__list">
          {essayAnswers.map(answer => (
            <div key={answer.id} className="essay-grading__card">
              <div className="essay-grading__student-info">
                <strong>Student:</strong> {answer.attempt?.student_name || 'N/A'}
                <br />
                <strong>Registration:</strong> {answer.attempt?.student_reg_number || 'N/A'}
              </div>
              <div className="essay-grading__question">
                <strong>Question:</strong> {answer.question_text}
              </div>
              <div className="essay-grading__answer">
                <strong>Answer:</strong>
                <p>{answer.essay_answer || '(No answer provided)'}</p>
              </div>
              <div className="essay-grading__grade-area">
                <label className="essay-grading__label">Marks awarded:</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  defaultValue={answer.marks_awarded}
                  onBlur={(e) => handleGrade(answer.id, e.target.value)}
                  placeholder="Enter marks"
                  className="essay-grading__input"
                />
                {gradingStatus[answer.id] === 'saving' && (
                  <span className="essay-grading__status essay-grading__status--saving">Saving...</span>
                )}
                {gradingStatus[answer.id] === 'saved' && (
                  <span className="essay-grading__status essay-grading__status--saved">✓ Saved</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EssayGrading;