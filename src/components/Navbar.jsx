import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, getProfileType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDashboardClick = () => {
    const profileType = getProfileType();
    if (profileType === 'student') {
      navigate('/student/dashboard');
    } else if (profileType === 'teacher') {
      navigate('/teacher/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">📚</span>
          <span className="navbar-brand-text">LearnHub</span>
        </Link>

        <button 
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="navbar-hamburger">☰</span>
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link navbar-link-primary">Sign Up</Link>
            </>
          ) : (
            <>
             <Link to="/" className="navbar-link">
                Home
              </Link>
              <button onClick={handleDashboardClick} className="navbar-link navbar-link-button">
                Dashboard
              </button>
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button onClick={handleLogout} className="navbar-link navbar-link-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;