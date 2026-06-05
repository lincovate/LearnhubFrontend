import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Timetable from '../components/Lesson/Timetable';
import Assignments from '../components/Lesson/Assignments';
import Attendance from '../components/Lesson/Attendance';
import Announcements from '../components/Lesson/Announcements';
import QnA from '../components/Lesson/QnA';
import StudentExams from './exams/StudentExams';
import TakeExam from './exams/TakeExam';
import ExamResult from './exams/ExamResult';
import ReferenceStudent from './references/ReferenceStudent';
import Analytics from '../components/Lesson/Analytics';
import CourseEnrollment from '../components/Lesson/CourseEnrollment';
import AttendanceMarking from '../components/Lesson/AttendanceMarking';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const tabs = [
        { id: 'announcements', name: 'Announcements', icon: '📢', path: '/student/announcements', component: <Announcements /> },
        { id: 'timetable', name: 'Timetable', icon: '📅', path: '/student/timetable', component: <Timetable /> },
        { id: 'attendance-mark', name: 'Mark Attendance', icon: '📝', path: '/student/attendance-mark', component: <AttendanceMarking /> },
        { id: 'assignments', name: 'Assignments', icon: '📝', path: '/student/assignments', component: <Assignments /> },
        { id: 'qna', name: 'Q&A', icon: '💬', path: '/student/qna', component: <QnA /> },
        { id: 'exams', name: 'Exams', icon: '📝', path: '/student/exams', component: <StudentExams /> },
        { id: 'references', name: 'Resources', icon: '📖', path: '/student/references', component: <ReferenceStudent /> },
        { id: 'analytics', name: 'Analytics', icon: '📊', path: '/student/analytics', component: <Analytics /> },
    ];

    const getActiveTabFromPath = () => {
        const currentPath = location.pathname;
        if (currentPath.startsWith('/student/exams')) {
            return 'exams';
        }
        if (currentPath === '/student/references') return 'references';
        const tab = tabs.find(tab => currentPath === tab.path);
        return tab ? tab.id : 'announcements';
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

    useEffect(() => {
        if (location.pathname === '/student/dashboard' || location.pathname === '/student') {
            navigate('/student/announcements');
        }
    }, [navigate, location.pathname]);

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

    const getCurrentComponent = () => {
        const path = location.pathname;
        // Extract exam ID from /student/exams/take/123
        const takeMatch = path.match(/^\/student\/exams\/take\/(\d+)$/);
        if (takeMatch) {
            const examId = takeMatch[1];
            return <TakeExam id={examId} />;
        }
        // Extract exam ID from /student/exams/result/123
        const resultMatch = path.match(/^\/student\/exams\/result\/(\d+)$/);
        if (resultMatch) {
            const examId = resultMatch[1];
            return <ExamResult id={examId} />;
        }
        // Default: render the tab component
        const tab = tabs.find(t => t.id === activeTab);
        return tab ? tab.component : <Announcements />;
    };

    return (
        <div className="student-dashboard">
            <aside className={`student-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="student-sidebar-header">
                    <div className="student-sidebar-logo">
                        <span>🎓</span>
                        <span>LearnHub</span>
                    </div>
                    <div className="student-sidebar-subtitle">Student Portal</div>
                </div>
                <nav className="student-sidebar-nav">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`student-sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.path, tab.id)}
                        >
                            <span className="student-nav-icon">{tab.icon}</span>
                            <span className="student-nav-text">{tab.name}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            <button 
                className={`student-floating-toggle ${isSidebarOpen ? 'open' : 'closed'}`}
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <span className="student-toggle-arrow">◀</span>
            </button>

            {!isDesktop && isSidebarOpen && (
                <div className="student-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            <main className={`student-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="student-dashboard-header">
                    <h1>Welcome back, {user?.first_name || user?.username}!</h1>
                    <p>Track your learning progress and stay organized</p>
                </div>
                <div className="student-tab-content">
                    {getCurrentComponent()}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;