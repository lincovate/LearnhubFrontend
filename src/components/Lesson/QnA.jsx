import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import './QnA.css';

const QnA = () => {
    const { user, isTeacher, isStudent, loading: authLoading, profileType } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showAnswerForm, setShowAnswerForm] = useState(null);
    const [questionForm, setQuestionForm] = useState({
        title: '',
        content: '',
        course: '',
        tags: ''
    });
    const [answerForm, setAnswerForm] = useState({
        content: ''
    });
    
    // Track user votes for each answer
    const [userVotes, setUserVotes] = useState({});
    
    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [selectedCourse, authLoading]);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, questionsRes] = await Promise.all([
                api.getCourses(),
                selectedCourse ? api.getQuestionsByCourse(selectedCourse) : api.getQuestions()
            ]);
            setCourses(coursesRes.data);
            setQuestions(questionsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleAskQuestion = async (e) => {
        e.preventDefault();
        
        if (!questionForm.title || !questionForm.content || !questionForm.course) {
            alert('Please fill in all required fields');
            return;
        }
        
        const dataToSend = {
            title: questionForm.title,
            content: questionForm.content,
            course: parseInt(questionForm.course, 10),
            tags: questionForm.tags
        };
        
        try {
            await api.createQuestion(dataToSend);
            setShowQuestionForm(false);
            setQuestionForm({ title: '', content: '', course: '', tags: '' });
            fetchData();
            alert('Question posted successfully!');
        } catch (error) {
            console.error('Error posting question:', error);
            alert(error.response?.data?.error || 'Failed to post question');
        }
    };
    
    const handlePostAnswer = async (questionId) => {
        if (!answerForm.content) {
            alert('Please write an answer');
            return;
        }
        
        try {
            await api.answerQuestion(questionId, answerForm.content);
            setShowAnswerForm(null);
            setAnswerForm({ content: '' });
            fetchData();
            alert('Answer posted successfully!');
        } catch (error) {
            console.error('Error posting answer:', error);
            alert(error.response?.data?.error || 'Failed to post answer');
        }
    };
    
    const handleAcceptAnswer = async (answerId) => {
        try {
            await api.acceptAnswer(answerId);
            fetchData();
            alert('Answer accepted successfully!');
        } catch (error) {
            console.error('Error accepting answer:', error);
            alert(error.response?.data?.error || 'Failed to accept answer');
        }
    };
    
    const handleUpvoteAnswer = async (answerId) => {
        try {
            if (userVotes[answerId] === 'upvote') {
                await api.removeUpvote(answerId);
                setUserVotes(prev => ({ ...prev, [answerId]: null }));
            } 
            else if (userVotes[answerId] === 'downvote') {
                await api.removeDownvote(answerId);
                await api.upvoteAnswer(answerId);
                setUserVotes(prev => ({ ...prev, [answerId]: 'upvote' }));
            } 
            else {
                await api.upvoteAnswer(answerId);
                setUserVotes(prev => ({ ...prev, [answerId]: 'upvote' }));
            }
            fetchData();
        } catch (error) {
            console.error('Error upvoting answer:', error);
            alert(error.response?.data?.error || 'Failed to upvote answer');
        }
    };
    
    const handleDownvoteAnswer = async (answerId) => {
        try {
            if (userVotes[answerId] === 'downvote') {
                await api.removeDownvote(answerId);
                setUserVotes(prev => ({ ...prev, [answerId]: null }));
            } 
            else if (userVotes[answerId] === 'upvote') {
                await api.removeUpvote(answerId);
                await api.downvoteAnswer(answerId);
                setUserVotes(prev => ({ ...prev, [answerId]: 'downvote' }));
            } 
            else {
                await api.downvoteAnswer(answerId);
                setUserVotes(prev => ({ ...prev, [answerId]: 'downvote' }));
            }
            fetchData();
        } catch (error) {
            console.error('Error downvoting answer:', error);
            alert(error.response?.data?.error || 'Failed to downvote answer');
        }
    };
    
    if (authLoading || loading) {
        return (
            <div className="qna-loading-container">
                <div className="qna-spinner"></div>
                <p>Loading questions...</p>
            </div>
        );
    }
    
    return (
        <div className="qna-container">
            <div className="qna-header">
                <div>
                    <h2>💬 Questions & Answers</h2>
                    <p className="qna-subtitle">Get help from your instructors and peers</p>
                </div>
                <button className="qna-ask-btn" onClick={() => setShowQuestionForm(!showQuestionForm)}>
                    {showQuestionForm ? 'Cancel' : '+ Ask a Question'}
                </button>
            </div>
            
            <div className="qna-course-filter">
                <select 
                    value={selectedCourse || ''} 
                    onChange={(e) => setSelectedCourse(e.target.value || null)}
                    className="qna-course-select"
                >
                    <option value="">All Courses</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>
            
            {showQuestionForm && (
                <form className="qna-question-form" onSubmit={handleAskQuestion}>
                    <h3 className="qna-form-title">Ask a New Question</h3>
                    
                    <div className="qna-form-group">
                        <label className="qna-form-label">Title *</label>
                        <input
                            type="text"
                            placeholder="e.g., How do I solve this Python error?"
                            value={questionForm.title}
                            onChange={(e) => setQuestionForm({...questionForm, title: e.target.value})}
                            required
                            className="qna-form-input"
                        />
                    </div>
                    
                    <div className="qna-form-group">
                        <label className="qna-form-label">Question *</label>
                        <textarea
                            placeholder="Describe your question in detail..."
                            value={questionForm.content}
                            onChange={(e) => setQuestionForm({...questionForm, content: e.target.value})}
                            rows="5"
                            required
                            className="qna-form-textarea"
                        />
                    </div>
                    
                    <div className="qna-form-group">
                        <label className="qna-form-label">Course *</label>
                        <select
                            value={questionForm.course}
                            onChange={(e) => setQuestionForm({...questionForm, course: e.target.value})}
                            required
                            className="qna-form-select"
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="qna-form-group">
                        <label className="qna-form-label">Tags (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., python, django, database"
                            value={questionForm.tags}
                            onChange={(e) => setQuestionForm({...questionForm, tags: e.target.value})}
                            className="qna-form-input"
                        />
                        <small className="qna-form-hint">Separate tags with commas</small>
                    </div>
                    
                    <div className="qna-form-actions">
                        <button type="submit" className="qna-save-btn">Post Question</button>
                        <button type="button" className="qna-cancel-btn" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                    </div>
                </form>
            )}
            
            <div className="qna-questions-list">
                {questions.length === 0 ? (
                    <div className="qna-no-questions">
                        <p>No questions yet.</p>
                        <p>Be the first to ask a question!</p>
                    </div>
                ) : (
                    questions.map(question => (
                        <div key={question.id} className="qna-question-card">
                            <div className="qna-question-header">
                                <div className="qna-question-title">
                                    <h3>{question.title}</h3>
                                    {question.is_pinned && <span className="qna-pinned-badge">📌 Pinned</span>}
                                    {question.is_answered && <span className="qna-answered-badge">✓ Answered</span>}
                                </div>
                                <div className="qna-question-meta">
                                    <span className="qna-course-tag">{question.course_code}</span>
                                    {question.tags && (
                                        <span className="qna-tags">
                                            {question.tags.split(',').map(tag => (
                                                <span key={tag} className="qna-tag">#{tag.trim()}</span>
                                            ))}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="qna-question-content">
                                <p>{question.content}</p>
                            </div>
                            
                            <div className="qna-question-footer">
                                <span className="qna-asked-by">Asked by: {question.asked_by_full_name || question.asked_by_name}</span>
                                <span className="qna-date">{new Date(question.created_at).toLocaleDateString()}</span>
                                <span className="qna-answer-count">{question.answer_count} answers</span>
                                {isTeacher && (
                                    <span className="qna-teacher-badge">👨‍🏫 Teacher</span>
                                )}
                            </div>
                            
                            <div className="qna-answers-section">
                                <h4 className="qna-answers-title">Answers ({question.answer_count})</h4>
                                {question.answers && question.answers.length > 0 ? (
                                    question.answers.map(answer => {
                                        const netVotes = (answer.upvotes || 0) - (answer.downvotes || 0);
                                        return (
                                            <div key={answer.id} className={`qna-answer-card ${answer.is_accepted ? 'qna-answer-accepted' : ''}`}>
                                                <div className="qna-answer-header">
                                                    <span className="qna-answerer">{answer.answered_by_full_name || answer.answered_by_name}</span>
                                                    <span className="qna-answer-date">{new Date(answer.created_at).toLocaleDateString()}</span>
                                                    {answer.is_accepted && <span className="qna-accepted-badge">✓ Accepted Answer</span>}
                                                </div>
                                                <div className="qna-answer-content">
                                                    <p>{answer.content}</p>
                                                </div>
                                                <div className="qna-answer-actions">
                                                    <button 
                                                        className={`qna-vote-btn qna-upvote-btn ${userVotes[answer.id] === 'upvote' ? 'qna-active' : ''}`}
                                                        onClick={() => handleUpvoteAnswer(answer.id)}
                                                        title={userVotes[answer.id] === 'upvote' ? 'Remove upvote' : 'Upvote'}
                                                    >
                                                        👍 {answer.upvotes || 0}
                                                    </button>
                                                    <button 
                                                        className={`qna-vote-btn qna-downvote-btn ${userVotes[answer.id] === 'downvote' ? 'qna-active' : ''}`}
                                                        onClick={() => handleDownvoteAnswer(answer.id)}
                                                        title={userVotes[answer.id] === 'downvote' ? 'Remove downvote' : 'Downvote'}
                                                    >
                                                        👎 {answer.downvotes || 0}
                                                    </button>
                                                    <span className="qna-net-votes">
                                                        Net: {netVotes > 0 ? `+${netVotes}` : netVotes}
                                                    </span>
                                                    {isTeacher && !answer.is_accepted && (
                                                        <button 
                                                            className="qna-accept-btn"
                                                            onClick={() => handleAcceptAnswer(answer.id)}
                                                        >
                                                            ✓ Accept as Answer
                                                        </button>
                                                    )}
                                                    {answer.is_accepted && (
                                                        <span className="qna-accepted-label">✓ Accepted Answer</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="qna-no-answers">No answers yet. Be the first to answer!</p>
                                )}
                                
                                {showAnswerForm === question.id ? (
                                    <form className="qna-answer-form" onSubmit={(e) => {
                                        e.preventDefault();
                                        handlePostAnswer(question.id);
                                    }}>
                                        <textarea
                                            placeholder="Write your answer..."
                                            value={answerForm.content}
                                            onChange={(e) => setAnswerForm({content: e.target.value})}
                                            rows="4"
                                            required
                                            className="qna-answer-textarea"
                                        />
                                        <div className="qna-form-actions">
                                            <button type="submit" className="qna-save-btn">Post Answer</button>
                                            <button type="button" className="qna-cancel-btn" onClick={() => setShowAnswerForm(null)}>Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button 
                                        className="qna-answer-btn"
                                        onClick={() => setShowAnswerForm(question.id)}
                                    >
                                        Write an Answer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QnA;