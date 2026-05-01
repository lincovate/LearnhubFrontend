import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false); // ADD THIS
  const { forgotPassword } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || 'Failed to send reset link. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="forgot-container">
        <div className="forgot-card forgot-card-success animate-slide-up">
          <div className="forgot-success-content">
            <div className="forgot-success-icon">✉️</div>
            <div className="forgot-success-icon-bg">📧</div>
            <h2 className="forgot-success-title">Check Your Email</h2>
            <p className="forgot-success-message">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="forgot-success-instructions">
              <p>Please check your inbox and follow the instructions to reset your password.</p>
              <p className="forgot-success-note">Didn't receive the email? Check your spam folder.</p>
            </div>
            <Link to="/login" className="forgot-btn forgot-btn-primary forgot-btn-block">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card animate-slide-up">
        <div className="forgot-header">
          <div className="forgot-header-icon">🔐</div>
          <h2 className="forgot-title">Forgot Password?</h2>
          <p className="forgot-subtitle">
            Don't worry! Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {error && (
          <div className="forgot-error">
            <span className="forgot-error-icon">⚠️</span>
            <span className="forgot-error-text">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="forgot-form-group">
            <label className="forgot-label">Email Address</label>
            <div className="forgot-input-wrapper">
              <span className="forgot-input-icon">📧</span>
              <input
                type="email"
                className="forgot-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="forgot-btn forgot-btn-primary forgot-btn-block" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="forgot-spinner"></span>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
        
        <div className="forgot-back-link">
          <Link to="/login" className="forgot-back-link-btn">
            ← Back to Login
          </Link>
        </div>
        
        <div className="forgot-help">
          <p className="forgot-help-text">
            Need help?{' '}
            <button 
              onClick={() => setShowSupportModal(true)}
              className="forgot-help-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="forgot-modal-overlay" onClick={() => setShowSupportModal(false)}>
          <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
            <button className="forgot-modal-close" onClick={() => setShowSupportModal(false)}>×</button>
            <div className="forgot-modal-icon">💬</div>
            <h3 className="forgot-modal-title">Contact Support</h3>
            <div className="forgot-modal-content">
              <div className="forgot-support-message">
                <p>👋 <strong>Choose your mode of contact and ask for Josiah</strong></p>
                <p className="forgot-support-reminder">
                  📌 <em>Remember: You are visiting Lincovate Consultation/Support Room</em>
                </p>
              </div>
              
              <div className="forgot-contact-options">
                <a 
                  href="mailto:support@lincovate.com?subject=Password Reset Support Request&body=Hello Lincovate Team, I need help with resetting my password fro learnhub Josiah's creation..."
                  className="forgot-contact-option"
                >
                  <span className="forgot-contact-icon">📧</span>
                  <div>
                    <strong>Email Support</strong>
                    <small>support@lincovate.com</small>
                  </div>
                </a>
                
                <a 
                  href="tel:+254791192398"
                  className="forgot-contact-option"
                >
                  <span className="forgot-contact-icon">📞</span>
                  <div>
                    <strong>Phone Call</strong>
                    <small>press link to call</small>
                  </div>
                </a>
                
                <a 
                  href="https://wa.me/254791192398?text=Hello%20Josiah,%20I%20need%20help%20with%20resetting%20my%20password"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="forgot-contact-option"
                >
                  <span className="forgot-contact-icon">💬</span>
                  <div>
                    <strong>WhatsApp</strong>
                    <small>Chat with Josiah</small>
                  </div>
                </a>
                
                <button 
                  onClick={() => window.open('https://www.lincovate.com/#/consultation/method/', '_blank')}
                  className="forgot-contact-option forgot-contact-link"
                >
                  <span className="forgot-contact-icon">🌐</span>
                  <div>
                    <strong>Visit Consultation Room</strong>
                    <small>Lincovate Support Portal</small>
                  </div>
                </button>
              </div>
              
              <div className="forgot-modal-footer">
                <button 
                  className="forgot-modal-btn"
                  onClick={() => setShowSupportModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;