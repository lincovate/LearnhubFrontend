import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LearnMore.css';

const LearnMore = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverEffect, setHoverEffect] = useState(false);
  const sectionRef = useRef(null);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    "Expert-led courses",
    "Interactive learning",
    "Global community",
    "Flexible schedule"
  ];

  return (
    <div ref={sectionRef} className="learnmore-container">
      <div className="learnmore-background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="learnmore-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      <div className="learnmore-wrapper">
        <div className={`learnmore-content ${isVisible ? 'learnmore-animate' : ''}`}>
          <div className="learnmore-badge">
            <span className="learnmore-badge-text">Limited Time</span>
          </div>
          
          <h2 className="learnmore-title">
            Ready to Transform Your
            <span className="learnmore-gradient-text"> Learning Journey?</span>
          </h2>
          
          <p className="learnmore-description">
            Join thousands of successful learners who have already discovered the future of education. 
            Experience personalized learning paths, real-time feedback, and a community that grows with you.
          </p>

          <div className="learnmore-features">
            {features.map((feature, index) => (
              <div key={index} className="learnmore-feature">
                <svg className="learnmore-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="learnmore-cta-wrapper">
            <Link 
              to="/learn-more" 
              className={`learnmore-cta-button ${hoverEffect ? 'learnmore-hover' : ''}`}
              onMouseEnter={() => setHoverEffect(true)}
              onMouseLeave={() => setHoverEffect(false)}
            >
              <span className="learnmore-cta-text">Discover More</span>
              <svg className="learnmore-cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="learnmore-cta-glow"></div>
            </Link>
            
            <p className="learnmore-hint">
              <svg className="learnmore-hint-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No commitment • Cancel anytime
            </p>
          </div>
        </div>

        <div className={`learnmore-visual ${isVisible ? 'learnmore-animate-delayed' : ''}`}>
          <div className="learnmore-floating-card learnmore-card-1">
            <div className="learnmore-card-icon">📚</div>
            <div className="learnmore-card-text">100+ Courses</div>
          </div>
          <div className="learnmore-floating-card learnmore-card-2">
            <div className="learnmore-card-icon">🎓</div>
            <div className="learnmore-card-text">Expert Teachers</div>
          </div>
          <div className="learnmore-floating-card learnmore-card-3">
            <div className="learnmore-card-icon">🌍</div>
            <div className="learnmore-card-text">Global Community</div>
          </div>
          
          <div className="learnmore-pulse-ring"></div>
          <div className="learnmore-pulse-ring learnmore-pulse-ring-delayed"></div>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;