import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Timetable from '../components/Lesson/Timetable';
import Assignments from '../components/Lesson/Assignments';
import Attendance from '../components/Lesson/Attendance';
import Announcements from '../components/Lesson/Announcements';
import QnA from '../components/Lesson/QnA';
import Analytics from '../components/Lesson/Analytics';
import TeacherAttendanceControl from '../components/Lesson/TeacherAttendanceControl';
import GradingView from '../components/Lesson/GradingView';
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
        { id: 'analytics', name: 'Analytics', icon: '📊', path: '/teacher/analytics', component: <Analytics /> }
    ];

    const getActiveTabFromPath = () => {
        const currentPath = location.pathname;
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

    const getCurrentComponent = () => {
        if (location.pathname.startsWith('/teacher/grading/') && location.pathname !== '/teacher/grading') {
            return <GradingView />;
        }
        const tab = tabs.find(t => t.id === activeTab);
        return tab ? tab.component : <Timetable />;
    };

    return (
        <div className="teacher-dashboard">
            {/* Sidebar */}
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

            {/* Floating Toggle Button */}
            <button 
                className={`teacher-floating-toggle ${isSidebarOpen ? 'open' : 'closed'}`}
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <span className="teacher-toggle-arrow">◀</span>
            </button>

            {/* Overlay for mobile */}
            {!isDesktop && isSidebarOpen && (
                <div className="teacher-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Main Content */}
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