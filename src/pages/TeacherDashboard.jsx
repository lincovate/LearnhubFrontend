import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Timetable from '../components/Lesson/Timetable';
import Assignments from '../components/Lesson/Assignments';
import Attendance from '../components/Lesson/Attendance';
import Announcements from '../components/Lesson/Announcements';
import QnA from '../components/Lesson/QnA';
import TeacherExams from './Exams/TeacherExams';
import Analytics from '../components/Lesson/Analytics';
import TeacherAttendanceControl from '../components/Lesson/TeacherAttendanceControl';
import GradingView from '../components/Lesson/GradingView';
import CreateExam from './exams/CreateExam';
import EditExam from './exams/EditExam';
import ExamRanking from './exams/ExamRanking';
import CourseLeaderboard from './exams/CourseLeaderboard';
import ChatPage from './pages/ChatPage';
import ReferencePage from './pages/ReferencePage';
import ReturnedWorkPage from './pages/ReturnedWorkPage';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const tabs = [
        { id: 'timetable', name: 'Timetable', icon: '📅', path: '/teacher/timetable', component: <Timetable /> },
        { id: 'attendance-control', name: 'Attendance Control', icon: '🎮', path: '/teacher/attendance-control', component: <TeacherAttendanceControl /> },
        { id: 'assignments', name: 'Assignments', icon: '📝', path: '/teacher/assignments', component: <Assignments /> },
        { id: 'grading', name: 'Grade Submissions', icon: '📊', path: '/teacher/grading', component: <GradingView /> },
        { id: 'attendance-record', name: 'Attendance Records', icon: '📋', path: '/teacher/attendance-record', component: <Attendance /> },
        { id: 'announcements', name: 'Announcements', icon: '📢', path: '/teacher/announcements', component: <Announcements /> },
        { id: 'qna', name: 'Q&A', icon: '💬', path: '/teacher/qna', component: <QnA /> },
        { id: 'exams', name: 'Exams', icon: '📝', path: '/teacher/exams', component: <TeacherExams /> },
        { id: 'analytics', name: 'Analytics', icon: '📊', path: '/teacher/analytics', component: <Analytics /> },
        { id: 'chat', name: 'Messages', icon: '💬', path: '/teacher/chat', component: <ChatPage /> },
        { id: 'reference', name: 'Resources', icon: '📖', path: '/teacher/reference', component: <ReferencePage /> },
        { id: 'returned-work', name: 'Returned Work', icon: '🔄', path: '/teacher/returned-work', component: <ReturnedWorkPage /> }
    ];

    const getActiveTabFromPath = () => {
        const currentPath = location.pathname;
        if (currentPath.startsWith('/teacher/exams')) {
            return 'exams';
        }
        if (currentPath.startsWith('/teacher/grading/')) {
            return 'grading';
        }
        const tab = tabs.find(tab => currentPath === tab.path);
        return tab ? tab.id : 'timetable';
    };

    const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (desktop) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        setActiveTab(getActiveTabFromPath());
        return () => window.removeEventListener('resize', handleResize);
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleTabClick = (path, tabId) => {
        setActiveTab(tabId);
        navigate(path);
        if (!isDesktop) {
            setIsSidebarOpen(false);
        }
    };

    // Helper to extract exam ID from paths like /teacher/exams/123/edit or /teacher/exams/123/ranking
    const getExamIdFromPath = (path) => {
        const match = path.match(/^\/teacher\/exams\/(\d+)\/(?:edit|ranking)$/);
        return match ? match[1] : null;
    };

    const getCurrentComponent = () => {
        const path = location.pathname;

        // Create Exam (no ID)
        if (path === '/teacher/exams/create') {
            return <CreateExam />;
        }

        // Edit Exam (with ID)
        if (path.match(/^\/teacher\/exams\/\d+\/edit$/)) {
            const examId = getExamIdFromPath(path);
            return <EditExam key={examId} id={examId} />;
        }

        // Ranking (with ID)
        if (path.match(/^\/teacher\/exams\/\d+\/ranking$/)) {
            const examId = getExamIdFromPath(path);
            return <ExamRanking key={examId} id={examId} />;
        }

        // Course Leaderboard
        if (path === '/teacher/course-leaderboard') {
            return <CourseLeaderboard />;
        }

        // Grading view (existing)
        if (path.startsWith('/teacher/grading/') && path !== '/teacher/grading') {
            return <GradingView />;
        }

        // Default: render the tab component
        const tab = tabs.find(t => t.id === activeTab);
        return tab ? tab.component : <Timetable />;
    };

    return (
        <div className="teacher-dashboard">
            <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="teacher-sidebar-header">
                    <div className="teacher-sidebar-logo">
                        <span>📚</span>
                        <span>LearnHub</span>
                    </div>
                    <div className="teacher-sidebar-subtitle">Teacher Portal</div>
                </div>
                <nav className="teacher-sidebar-nav">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`teacher-sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.path, tab.id)}
                        >
                            <span className="teacher-nav-icon">{tab.icon}</span>
                            <span className="teacher-nav-text">{tab.name}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            <button 
                className={`teacher-floating-toggle ${isSidebarOpen ? 'open' : 'closed'}`}
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <span className="teacher-toggle-arrow">◀</span>
            </button>

            {!isDesktop && isSidebarOpen && (
                <div className="teacher-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            <main className={`teacher-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="teacher-dashboard-header">
                    <h1>Welcome back, Prof. {user?.last_name || user?.username}!</h1>
                    <p>Manage your courses, assignments, and students</p>
                </div>
                <div className="teacher-tab-content">
                    {getCurrentComponent()}
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;