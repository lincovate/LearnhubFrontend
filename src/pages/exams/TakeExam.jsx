import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../../api/exams';
import './TakeExam.css';

const TakeExam = ({ id }) => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('confirm'); // 'confirm' or 'info'
  const [resolveModal, setResolveModal] = useState(null);
  const blurCount = useRef(0);
  const intervalRef = useRef(null);
  const questionRefs = useRef([]);
  const submittedRef = useRef(false);

  // --- Anti-cheat handlers (unchanged) ---
  const preventCopy = (e) => {
    e.preventDefault();
    setWarning('Copying is not allowed during the exam.');
    setTimeout(() => setWarning(''), 1500);
    return false;
  };

  const preventPaste = (e) => {
    e.preventDefault();
    setWarning('Pasting is not allowed during the exam.');
    setTimeout(() => setWarning(''), 1500);
    return false;
  };

  const preventCut = (e) => {
    e.preventDefault();
    setWarning('Cutting is not allowed during the exam.');
    setTimeout(() => setWarning(''), 1500);
    return false;
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
    setWarning('Right-click is disabled during the exam.');
    setTimeout(() => setWarning(''), 1500);
    return false;
  };

  const preventSelection = (e) => {
    e.preventDefault();
    return false;
  };

  const preventKeyShortcuts = (e) => {
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || 
                     e.key === 'x' || e.key === 'X' || e.key === 'p' || e.key === 'P' || 
                     e.key === 's' || e.key === 'S')) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault();
      setWarning('That keyboard shortcut is not allowed.');
      setTimeout(() => setWarning(''), 1500);
      return false;
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      blurCount.current++;
      setIsBlurred(true);
      setWarning(`Warning: You left the exam window (${blurCount.current}). Continuing may be considered cheating.`);
    } else {
      setIsBlurred(false);
      setWarning('');
    }
  };

  const handleWindowBlur = () => {
    blurCount.current++;
    setIsBlurred(true);
    setWarning(`Warning: You left the exam window (${blurCount.current}). Continuing may be considered cheating.`);
  };

  const handleWindowFocus = () => {
    setIsBlurred(false);
    setWarning('');
  };

  const preventScreenshotKeys = (e) => {
    if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'PrintScreen') || (e.altKey && e.key === 'PrintScreen')) {
      e.preventDefault();
      setWarning('Screenshots are not allowed.');
      setTimeout(() => setWarning(''), 1500);
      return false;
    }
    if ((e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) ||
        (e.ctrlKey && e.shiftKey && (e.key === '3' || e.key === '4'))) {
      e.preventDefault();
      setWarning('Screenshots are not allowed.');
      setTimeout(() => setWarning(''), 1500);
      return false;
    }
  };

  useEffect(() => {
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCut);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('keydown', preventKeyShortcuts);
    document.addEventListener('keydown', preventScreenshotKeys);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('dragstart', preventCopy);
    document.addEventListener('drop', preventPaste);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCut);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('keydown', preventKeyShortcuts);
      document.removeEventListener('keydown', preventScreenshotKeys);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('dragstart', preventCopy);
      document.removeEventListener('drop', preventPaste);
    };
  }, []);

  // --- Modal helper ---
  const showModal = (message, type = 'confirm') => {
    return new Promise((resolve) => {
      setModalMessage(message);
      setModalType(type);
      setModalVisible(true);
      setResolveModal(() => resolve);
    });
  };

  const closeModal = (confirmed = false) => {
    setModalVisible(false);
    if (resolveModal) {
      resolveModal(confirmed);
      setResolveModal(null);
    }
  };

  // --- Exam logic ---
  useEffect(() => {
    const stored = localStorage.getItem(`exam_${id}`);
    if (stored) {
      const data = JSON.parse(stored);
      setExamData(data);
      if (data.existing_answers) {
        setAnswers(data.existing_answers);
        examsApi.saveProgress(data.attempt_id, null, data.existing_answers);
      } else {
        const savedProgress = examsApi.getProgress(data.attempt_id);
        setAnswers(savedProgress);
      }
    } else {
      startExam();
    }
  }, [id]);

  useEffect(() => {
    if (examData && !submittedRef.current) {
      intervalRef.current = setInterval(() => {
        const remaining = examsApi.getTimeRemaining(examData.start_time, examData.time_limit_minutes);
        setTimeLeft(remaining);
        if (remaining.expired && !submittedRef.current) {
          clearInterval(intervalRef.current);
          // Show time expiry modal first, then auto-submit (or submit and then show modal)
          showModal(" Oh no! Your time is up.  Cross your fingers and pray you pass! 😢", "info")
            .then(() => handleSubmit(true));
        }
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [examData]);

  const startExam = async () => {
    try {
      const response = await examsApi.startExam(id);
      setExamData(response.data);
      if (response.data.existing_answers) {
        setAnswers(response.data.existing_answers);
        examsApi.saveProgress(response.data.attempt_id, null, response.data.existing_answers);
      }
      localStorage.setItem(`exam_${id}`, JSON.stringify(response.data));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start exam');
      navigate('/student/exams');
    }
  };

  const handleAnswerChange = async (questionId, answerData) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerData }));
    examsApi.saveProgress(examData.attempt_id, questionId, answerData);
    try {
      await examsApi.saveAnswer(id, questionId, answerData);
    } catch (err) {
      console.error('Failed to save answer to backend:', err);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (submitting || submittedRef.current) return;
    if (!auto) {
      const confirmed = await showModal('Are you sure you want to submit your exam?', 'confirm');
      if (!confirmed) return;
    }
    setSubmitting(true);
    submittedRef.current = true;
    try {
      await examsApi.submitExam(id, answers);
      examsApi.clearProgress(examData.attempt_id);
      localStorage.removeItem(`exam_${id}`);
      navigate(`/student/exams/result/${id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission failed');
      setSubmitting(false);
      submittedRef.current = false;
    }
  };

  const scrollToQuestion = (index) => {
    const element = questionRefs.current[index];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (answer.choice_id !== undefined) return true;
    if (answer.essay && answer.essay.trim() !== '') return true;
    if (answer.numeric !== undefined) return true;
    return false;
  };

  if (!examData) return <div className="take-exam-container">Loading exam...</div>;

  return (
    <div className="take-exam-container">
      {warning && <div className="exam-warning">{warning}</div>}
      {isBlurred && (
        <div className="exam-blur-overlay">
          <div className="blur-message">
            ⚠️ You have left the exam window! ⚠️<br />
            Please return to the exam tab immediately.<br />
            Repeated violations may be recorded.
          </div>
        </div>
      )}
      <div className={`exam-content ${isBlurred ? 'blurred' : ''}`}>
        <div className="exam-header">
          <h1>{examData.exam_title}</h1>
          <div className="timer">
            Time Remaining: {timeLeft.minutes}:{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
          </div>
        </div>

        <div className="exam-main-layout">
          <div className="exam-sidebar">
            <h3>Questions</h3>
            <div className="question-nav">
              {examData.questions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`question-nav-btn ${isQuestionAnswered(q.id) ? 'answered' : 'unanswered'}`}
                  onClick={() => scrollToQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="submission-info">
              <button onClick={() => handleSubmit(false)} disabled={submitting || isBlurred} className="sidebar-submit">
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>

          <div className="questions-list">
            {examData.questions.map((q, idx) => (
              <div
                key={q.id}
                className="question-card"
                ref={el => questionRefs.current[idx] = el}
              >
                <h3>Question {idx + 1}: {q.text} ({q.marks} marks)</h3>
                {q.question_type === 'MCQ' && (
                  <div className="choices">
                    {q.choices.map(choice => (
                      <label key={choice.id} className="choice">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          value={choice.id}
                          checked={answers[q.id]?.choice_id === choice.id}
                          onChange={() => handleAnswerChange(q.id, { choice_id: choice.id })}
                        />
                        {choice.text}
                      </label>
                    ))}
                  </div>
                )}
                {q.question_type === 'TF' && (
                  <div className="choices">
                    <label>
                      <input
                        type="radio"
                        name={`q${q.id}`}
                        value="true"
                        checked={answers[q.id]?.choice_id === true}
                        onChange={() => handleAnswerChange(q.id, { choice_id: true })}
                      /> True
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`q${q.id}`}
                        value="false"
                        checked={answers[q.id]?.choice_id === false}
                        onChange={() => handleAnswerChange(q.id, { choice_id: false })}
                      /> False
                    </label>
                  </div>
                )}
                {q.question_type === 'ESS' && (
                  <textarea
                    rows="4"
                    value={answers[q.id]?.essay || ''}
                    onChange={(e) => handleAnswerChange(q.id, { essay: e.target.value })}
                    placeholder="Write your answer here..."
                    disabled={isBlurred}
                  />
                )}
                {q.question_type === 'NUM' && (
                  <input
                    type="number"
                    step="any"
                    value={answers[q.id]?.numeric || ''}
                    onChange={(e) => handleAnswerChange(q.id, { numeric: parseFloat(e.target.value) })}
                    placeholder="Enter numeric answer"
                    disabled={isBlurred}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      {modalVisible && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-content">
              <p>{modalMessage}</p>
              {modalType === 'confirm' && (
                <div className="custom-modal-buttons">
                  <button onClick={() => closeModal(true)}>Yes, Submit</button>
                  <button onClick={() => closeModal(false)}>Cancel</button>
                </div>
              )}
              {modalType === 'info' && (
                <div className="custom-modal-buttons">
                  <button onClick={() => closeModal(true)}>OK</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;