import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import './EditExam.css';

const EditExam = ({ id }) => {
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    question_type: 'MCQ',
    marks: 1,
    order: 0,
    correct_numeric_answer: '',
    tf_correct: 'true',
  });

  const [newChoices, setNewChoices] = useState([
    { text: '', is_correct: false },
  ]);

  useEffect(() => {
    if (!id) {
      setError('No exam ID provided');
      setLoading(false);
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examRes, coursesRes] = await Promise.all([
        examsApi.getExam(id),
        examsApi.getMyCourses(),
      ]);
      setExam(examRes.data);
      setQuestions(examRes.data.questions || []);
      setAvailableCourses(coursesRes.data.results || coursesRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load exam or courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleExamUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        course: exam.course?.id || exam.course,
        title: exam.title,
        description: exam.description || '',
        time_limit_minutes: Number(exam.time_limit_minutes),
        start_datetime: exam.start_datetime,
        end_datetime: exam.end_datetime,
        is_active: exam.is_active,
      };
      await examsApi.updateExam(id, payload);
      alert('Exam updated successfully');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Update failed: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.text.trim()) {
      alert('Please enter question text');
      return;
    }
    try {
      const questionPayload = {
        exam: parseInt(id),
        text: newQuestion.text,
        question_type: newQuestion.question_type,
        marks: Number(newQuestion.marks),
        order: Number(newQuestion.order),
        correct_numeric_answer: newQuestion.question_type === 'NUM' ? Number(newQuestion.correct_numeric_answer) : null,
      };
      const questionRes = await examsApi.createQuestion(questionPayload);
      const savedQuestion = questionRes.data;

      if (newQuestion.question_type === 'MCQ') {
        const validChoices = newChoices.filter(c => c.text.trim() !== '');
        for (const choice of validChoices) {
          await examsApi.createChoice({
            question: savedQuestion.id,
            text: choice.text,
            is_correct: choice.is_correct,
          });
        }
      } else if (newQuestion.question_type === 'TF') {
        const isTrueCorrect = newQuestion.tf_correct === 'true';
        await examsApi.createChoice({
          question: savedQuestion.id,
          text: 'True',
          is_correct: isTrueCorrect,
        });
        await examsApi.createChoice({
          question: savedQuestion.id,
          text: 'False',
          is_correct: !isTrueCorrect,
        });
      }

      await loadData();
      setNewQuestion({
        text: '',
        question_type: 'MCQ',
        marks: 1,
        order: 0,
        correct_numeric_answer: '',
        tf_correct: 'true',
      });
      setNewChoices([{ text: '', is_correct: false }]);
      alert('Question added successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to add question');
    }
  };

  const addChoiceToNew = () => {
    setNewChoices([...newChoices, { text: '', is_correct: false }]);
  };

  const removeChoice = (index) => {
    const updated = [...newChoices];
    updated.splice(index, 1);
    setNewChoices(updated);
  };

  const updateNewChoice = (index, field, value) => {
    const updated = [...newChoices];
    updated[index][field] = value;
    setNewChoices(updated);
  };

  if (loading) return <div className="edit-exam edit-exam--loading">Loading...</div>;
  if (error) return <div className="edit-exam edit-exam--error">{error}</div>;
  if (!exam) return <div className="edit-exam edit-exam--empty">No exam found</div>;

  return (
    <div className="edit-exam">
      <div className="edit-exam__header">
        <h1 className="edit-exam__title">Edit Exam: {exam.title}</h1>
        <button className="edit-exam__back-btn" onClick={() => navigate('/teacher/exams')}>
          ← Back to Exams
        </button>
      </div>

      <form onSubmit={handleExamUpdate} className="edit-exam__form">
        <label className="edit-exam__label">Course *</label>
        <select
          className="edit-exam__select"
          value={exam.course?.id || exam.course}
          onChange={(e) =>
            setExam({
              ...exam,
              course: availableCourses.find(c => c.id === parseInt(e.target.value)),
            })
          }
          required
        >
          {availableCourses.map(course => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>

        <label className="edit-exam__label">Title</label>
        <input
          className="edit-exam__input"
          type="text"
          value={exam.title || ''}
          onChange={(e) => setExam({ ...exam, title: e.target.value })}
          required
        />

        <label className="edit-exam__label">Description</label>
        <textarea
          className="edit-exam__textarea"
          value={exam.description || ''}
          onChange={(e) => setExam({ ...exam, description: e.target.value })}
        />

        <label className="edit-exam__label">Time Limit (minutes)</label>
        <input
          className="edit-exam__input"
          type="number"
          min="1"
          value={exam.time_limit_minutes || 1}
          onChange={(e) =>
            setExam({ ...exam, time_limit_minutes: Number(e.target.value) })
          }
        />

        <label className="edit-exam__label">Start Date & Time</label>
        <input
          className="edit-exam__input"
          type="datetime-local"
          value={exam.start_datetime ? exam.start_datetime.slice(0, 16) : ''}
          onChange={(e) => setExam({ ...exam, start_datetime: e.target.value })}
        />

        <label className="edit-exam__label">End Date & Time</label>
        <input
          className="edit-exam__input"
          type="datetime-local"
          value={exam.end_datetime ? exam.end_datetime.slice(0, 16) : ''}
          onChange={(e) => setExam({ ...exam, end_datetime: e.target.value })}
        />

        <label className="edit-exam__checkbox-label">
          <input
            type="checkbox"
            checked={exam.is_active || false}
            onChange={(e) => setExam({ ...exam, is_active: e.target.checked })}
          />
          Active (visible to students)
        </label>

        <button type="submit" className="edit-exam__submit-btn">Update Exam</button>
      </form>

      <hr className="edit-exam__divider" />

      <h2 className="edit-exam__section-title">Questions</h2>
      {questions.length === 0 ? (
        <p className="edit-exam__empty-questions">No questions added yet.</p>
      ) : (
        <div className="edit-exam__questions-list">
          {questions.map((q, index) => (
            <div key={q.id} className="edit-exam__question-item">
              <div className="edit-exam__question-header">
                <h3 className="edit-exam__question-text">Q{index + 1}: {q.text}</h3>
                <span className="edit-exam__question-meta">
                  {q.marks} marks • {q.question_type}
                  {q.question_type === 'NUM' && q.correct_numeric_answer !== null && (
                    <span className="edit-exam__correct-answer"> (Correct: {q.correct_numeric_answer})</span>
                  )}
                </span>
              </div>
              {q.choices && q.choices.length > 0 && (
                <ul className="edit-exam__choices-list">
                  {q.choices.map((choice) => (
                    <li key={choice.id} className="edit-exam__choice-item">
                      {choice.text} {choice.is_correct && <strong>(Correct)</strong>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <hr className="edit-exam__divider" />

      <h2 className="edit-exam__section-title">Add New Question</h2>
      <div className="edit-exam__new-question">
        <input
          className="edit-exam__input edit-exam__input--question-text"
          type="text"
          placeholder="Question text"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
        />
        <select
          className="edit-exam__select edit-exam__select--question-type"
          value={newQuestion.question_type}
          onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
        >
          <option value="MCQ">Multiple Choice</option>
          <option value="TF">True / False</option>
          <option value="ESS">Essay</option>
          <option value="NUM">Numeric</option>
        </select>
        <input
          className="edit-exam__input edit-exam__input--marks"
          type="number"
          placeholder="Marks"
          min="1"
          value={newQuestion.marks}
          onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number(e.target.value) })}
        />
        <input
          className="edit-exam__input edit-exam__input--order"
          type="number"
          placeholder="Order"
          min="0"
          value={newQuestion.order}
          onChange={(e) => setNewQuestion({ ...newQuestion, order: Number(e.target.value) })}
        />
        {newQuestion.question_type === 'NUM' && (
          <input
            className="edit-exam__input edit-exam__input--numeric-answer"
            type="number"
            step="any"
            placeholder="Correct numeric answer"
            value={newQuestion.correct_numeric_answer}
            onChange={(e) => setNewQuestion({ ...newQuestion, correct_numeric_answer: e.target.value })}
          />
        )}
        {newQuestion.question_type === 'TF' && (
          <div className="edit-exam__tf-selector">
            <span className="edit-exam__tf-label">Correct answer:</span>
            <label className="edit-exam__tf-option">
              <input
                type="radio"
                name="tf_correct"
                value="true"
                checked={newQuestion.tf_correct === 'true'}
                onChange={() => setNewQuestion({ ...newQuestion, tf_correct: 'true' })}
              /> True
            </label>
            <label className="edit-exam__tf-option">
              <input
                type="radio"
                name="tf_correct"
                value="false"
                checked={newQuestion.tf_correct === 'false'}
                onChange={() => setNewQuestion({ ...newQuestion, tf_correct: 'false' })}
              /> False
            </label>
          </div>
        )}
      </div>

      {newQuestion.question_type === 'MCQ' && (
        <div className="edit-exam__choices-builder">
          <h3 className="edit-exam__subtitle">Choices</h3>
          {newChoices.map((choice, index) => (
            <div key={index} className="edit-exam__choice-row">
              <input
                className="edit-exam__input edit-exam__input--choice-text"
                type="text"
                placeholder={`Choice ${index + 1}`}
                value={choice.text}
                onChange={(e) => updateNewChoice(index, 'text', e.target.value)}
              />
              <label className="edit-exam__choice-correct">
                <input
                  type="checkbox"
                  checked={choice.is_correct}
                  onChange={(e) => updateNewChoice(index, 'is_correct', e.target.checked)}
                />
                Correct
              </label>
              {newChoices.length > 1 && (
                <button type="button" className="edit-exam__remove-choice-btn" onClick={() => removeChoice(index)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="edit-exam__add-choice-btn" onClick={addChoiceToNew}>+ Add Choice</button>
        </div>
      )}

      <div className="edit-exam__save-question">
        <button className="edit-exam__save-btn" onClick={addQuestion}>
          Save Question
        </button>
      </div>
    </div>
  );
};

export default EditExam;