import React, { useEffect, useRef, useState } from 'react';
import './Mission.css';

const Mission = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMission, setShowMission] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const missionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (missionRef.current) {
      observer.observe(missionRef.current);
    }

    return () => {
      if (missionRef.current) {
        observer.unobserve(missionRef.current);
      }
    };
  }, []);

  // Auto alternate between Mission and Vision every 10 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      if (!isFlipping) {
        setIsFlipping(true);
        setTimeout(() => {
          setShowMission(prev => !prev);
          setTimeout(() => {
            setIsFlipping(false);
          }, 600);
        }, 300);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isVisible, isFlipping]);

  return (
    <div ref={missionRef} className="mission-container">
      <div className="mission-background-glow"></div>
      
      <div className="mission-wrapper">
        <div className="mission-header">
          <span className="mission-badge">Our Purpose</span>
          <h2 className="mission-title">Shaping the Future of Education</h2>
          <p className="mission-subtitle">
            Driven by purpose, guided by vision
          </p>
        </div>

        {/* Glossy Card Container */}
        <div className="mission-glossy-container">
          <div className={`mission-glossy-card ${isFlipping ? 'mission-flipping' : ''}`}>
            
            {/* Mission Content */}
            <div className={`mission-content ${showMission ? 'mission-content-active' : 'mission-content-hidden'}`}>
              <div className="mission-glossy-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <div className="mission-tag">MISSION</div>
              
              <h3 className="mission-heading">Empowering Learners Worldwide</h3>
              
              <p className="mission-text">
                To provide accessible, high-quality education that transforms lives and creates opportunities 
                for learners across the globe. We strive to bridge the gap between aspiration and achievement 
                through innovative technology and expert instruction.
              </p>
              
              <div className="mission-stats">
                <div className="mission-stat">
                  <div className="mission-stat-number">50K+</div>
                  <div className="mission-stat-label">Learners Impacted</div>
                </div>
                <div className="mission-stat-divider"></div>
                <div className="mission-stat">
                  <div className="mission-stat-number">100+</div>
                  <div className="mission-stat-label">Countries Reached</div>
                </div>
              </div>
            </div>

            {/* Vision Content */}
            <div className={`mission-content ${!showMission ? 'mission-content-active' : 'mission-content-hidden'}`}>
              <div className="mission-glossy-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              
              <div className="mission-tag">VISION</div>
              
              <h3 className="mission-heading">A World of Equal Learning</h3>
              
              <p className="mission-text">
                To create a global community where anyone, anywhere can access world-class education 
                and achieve their full potential. We envision a future where learning knows no boundaries 
                and success is determined only by one's dedication and passion.
              </p>
              
              <div className="mission-goals">
                <div className="mission-goal">
                  <svg className="mission-goal-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Innovation in Education</span>
                </div>
                <div className="mission-goal">
                  <svg className="mission-goal-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Global Accessibility</span>
                </div>
                <div className="mission-goal">
                  <svg className="mission-goal-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Lifelong Learning</span>
                </div>
              </div>
            </div>

            {/* Glossy Overlay */}
            <div className="mission-glossy-overlay"></div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mission-status">
          <div className={`mission-status-dot ${showMission ? 'mission-status-active' : ''}`}></div>
          <span className="mission-status-text">
            {showMission ? 'Currently showing: Mission' : 'Currently showing: Vision'}
          </span>
          <div className={`mission-status-dot ${!showMission ? 'mission-status-active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default Mission;