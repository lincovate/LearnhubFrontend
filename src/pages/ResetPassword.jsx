// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ResetPassword.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link');
    }
  }, [location]);

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return { hasMinLength, hasUpperCase, hasNumber };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const { hasMinLength, hasUpperCase, hasNumber } = validatePassword(newPassword);
    if (!hasMinLength || !hasUpperCase || !hasNumber) {
      setError('Please meet all password requirements');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await resetPassword(token, newPassword, confirmPassword);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError(result.error || 'Failed to reset password. The link may have expired.');
    }
    
    setLoading(false);
  };

  const { hasMinLength, hasUpperCase, hasNumber } = validatePassword(newPassword);

  if (error && !token) {
    return (
      <div className="reset-container">
        <div className="reset-card reset-card-error animate-slide-up">
          <div className="reset-error-content">
            <div className="reset-error-icon">⚠️</div>
            <h2 className="reset-error-title">Invalid Reset Link</h2>
            <p className="reset-error-message">
              The password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="reset-btn reset-btn-primary">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-container">
        <div className="reset-card reset-card-success animate-slide-up">
          <div className="reset-success-content">
            <div className="reset-success-icon">✓</div>
            <h2 className="reset-success-title">Password Reset Successful!</h2>
            <p className="reset-success-message">
              Your password has been changed successfully.
            </p>
            <div className="reset-progress-bar">
              <div className="reset-progress-fill"></div>
            </div>
            <p className="reset-redirect-text">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-card animate-slide-up">
        <div className="reset-header">
          <div className="reset-header-icon">🔒</div>
          <h2 className="reset-title">Create New Password</h2>
          <p className="reset-subtitle">
            Please enter your new password below
          </p>
        </div>
        
        {error && (
          <div className="reset-error">
            <span className="reset-error-icon">⚠️</span>
            <span className="reset-error-text">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="reset-form">
          <div className="reset-form-group">
            <label className="reset-label">New Password</label>
            <div className="reset-password-field">
              <span className="reset-input-icon">🔐</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="reset-input"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="reset-form-group">
            <label className="reset-label">Confirm Password</label>
            <div className="reset-password-field">
              <span className="reset-input-icon">✅</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="reset-input"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="reset-requirements">
            <p className="reset-requirements-title">Password must:</p>
            <ul className="reset-requirements-list">
              <li className={hasMinLength ? 'valid' : ''}>
                <span className="reset-requirement-icon">
                  {hasMinLength ? '✓' : '○'}
                </span>
                Be at least 8 characters long
              </li>
              <li className={hasUpperCase ? 'valid' : ''}>
                <span className="reset-requirement-icon">
                  {hasUpperCase ? '✓' : '○'}
                </span>
                Contain at least one uppercase letter
              </li>
              <li className={hasNumber ? 'valid' : ''}>
                <span className="reset-requirement-icon">
                  {hasNumber ? '✓' : '○'}
                </span>
                Contain at least one number
              </li>
            </ul>
          </div>
          
          <button 
            type="submit" 
            className="reset-btn reset-btn-primary reset-btn-block" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="reset-spinner"></span>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
        
        <div className="reset-back-link">
          <Link to="/login" className="reset-back-link-btn">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;