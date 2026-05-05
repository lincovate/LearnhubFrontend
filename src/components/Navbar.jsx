import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, getProfileType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    // Remove body class when menu closes
    document.body.classList.remove('navbar-menu-open');
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    if (newState) {
      document.body.classList.add('navbar-menu-open');
    } else {
      document.body.classList.remove('navbar-menu-open');
    }
  };

  const handleDashboardClick = () => {
    const profileType = getProfileType();
    if (profileType === 'student') {
      navigate('/student/announcements');
    } else if (profileType === 'teacher') {
      navigate('/teacher/announcements');
    }
    closeMobileMenu();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    closeMobileMenu();
  };

  const handleLinkClick = () => {
    closeMobileMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={handleLinkClick}>
          <span className="navbar-brand-icon">📚</span>
          <span className="navbar-brand-text">LearnHub</span>
        </Link>

        <button 
          className="navbar-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="navbar-hamburger">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div className="navbar-overlay" onClick={closeMobileMenu}></div>
        )}

        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link" onClick={handleLinkClick}>
                Home
              </Link>
              <Link to="/About" className="navbar-link" onClick={handleLinkClick}>
                About
              </Link>
              <Link to="/Contact" className="navbar-link" onClick={handleLinkClick}>
                ContactUs
              </Link>
              <Link to="/login" className="navbar-link" onClick={handleLinkClick}>
                Login
              </Link>
              <Link to="/register" className="navbar-link navbar-link-primary" onClick={handleLinkClick}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="navbar-link" onClick={handleLinkClick}>
                Home
              </Link>
              <button 
                onClick={handleDashboardClick} 
                className="navbar-link navbar-link-button"
              >
                Dashboard
              </button>
              <Link to="/profile" className="navbar-link" onClick={handleLinkClick}>
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="navbar-link navbar-link-logout"
              >
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