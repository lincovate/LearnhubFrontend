import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    { icon: "🎓", title: "Expert Teachers", description: "Learn from experienced educators passionate about teaching" },
    { icon: "📚", title: "Quality Content", description: "Access high-quality learning materials and resources" },
    { icon: "💬", title: "Interactive Learning", description: "Engage with peers and teachers through discussions" },
    { icon: "⏰", title: "Flexible Schedule", description: "Learn at your own pace with flexible scheduling" }
  ];

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <h1 className="hero-title animate-slide-up">Welcome to LearnHub</h1>
          <p className="hero-subtitle animate-slide-up">
            Your premier online learning platform for quality education
          </p>
          <div className="hero-buttons animate-slide-up">
            {!user ? (
              <>
                <button onClick={() => navigate('/register')} className="btn btn-secondary btn-lg">
                  Get Started
                </button>
                <button onClick={() => navigate('/login')} className="btn btn-outline btn-lg">
                  Login
                </button>
              </>
            ) : (
              <button onClick={() => {
                const profileType = localStorage.getItem('profile_type');
                navigate(`/${profileType}/dashboard`);
              }} className="btn btn-secondary btn-lg">
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose LearnHub?</h2>
          <p className="section-subtitle">We provide the best learning experience with modern tools</p>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card animate-fade-in">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Expert Teachers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Courses Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;