// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, getProfileType } = useAuth();
  const navigate = useNavigate();

  // Load saved username from localStorage on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(username, password);
    
    if (result.success) {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      const profileType = getProfileType();
      if (profileType === 'student') {
        navigate('/student/dashboard');
      } else if (profileType === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Invalid username or password');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-decoration">
          <div className="login-circle login-circle-1"></div>
          <div className="login-circle login-circle-2"></div>
          <div className="login-circle login-circle-3"></div>
        </div>
        
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon">📚</span>
            <span className="login-logo-text">LearnHub</span>
          </div>
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue your learning journey</p>
        </div>
        
        {error && (
          <div className="login-error">
            <span className="login-error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <div className="login-input-icon">
              <span>👤</span>
            </div>
            <input
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="login-input-group">
            <div className="login-input-icon">
              <span>🔒</span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          <div className="login-options">
            <label className="login-checkbox">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="login-forgot-link">
              Forgot Password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="login-register-text">
            Don't have an account? <Link to="/register" className="login-register-link">Sign Up</Link>
          </p>
        </div>
      </div>
      
      <div className="login-footer-note">
        <p>© 2024 LearnHub. All rights reserved.</p>
        <p>Powered by Lincovate Technologies</p>
      </div>
    </div>
  );
};

export default Login;