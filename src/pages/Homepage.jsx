import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Mission from './Mission';
import LearnMore from './Learnmore';
import Footer from './Footer';
import Testimonial from './Testimonial';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(true);
  
  // Counter states
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);

  const carouselSlides = [
    {
      image: "/images/comp.png",
      title: "Welcome to LearnHub",
      subtitle: "Your premier online learning platform for quality education",
      cta: "Start Learning Today"
    },
    {
      image: "/images/hall.png",
      title: "Learn from Experts",
      subtitle: "Access 1000+ courses taught by industry professionals",
      cta: "Explore Courses"
    },
    {
      image: "/images/map.png",
      title: "Interact with the People",
      subtitle: "Share ideas among each other and learn together",
      cta: "Socialise with peers"
    },
    {
      image: "/images/happy.png",
      title: "Join Our Community",
      subtitle: "Connect with 5000+ active learners worldwide",
      cta: "Join Now"
    }
  ];

  // Animation function for counters
  const animateNumber = (start, end, duration, setter) => {
    const startTime = performance.now();
    const increment = (end - start) / (duration / 16);
    
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed < duration) {
        const value = Math.min(start + (increment * (elapsed / 16)), end);
        setter(Math.floor(value));
        requestAnimationFrame(updateNumber);
      } else {
        setter(end);
      }
    };
    
    requestAnimationFrame(updateNumber);
  };

  // Intersection Observer for stats section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateNumber(0, 5000, 5000, setStudentCount);
            animateNumber(0, 200, 5000, setTeacherCount);
            animateNumber(0, 1000, 5000, setCourseCount);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  // Observer for See More button visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setShowSeeMore(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const handleSeeMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: "🎓", title: "Expert Teachers", description: "Learn from experienced educators passionate about teaching" },
    { icon: "📚", title: "Quality Content", description: "Access high-quality learning materials and resources shared within" },
    { icon: "💬", title: "Interactive Learning", description: "Engage with peers and teachers through discussions" },
    { icon: "⏰", title: "Flexible Schedule", description: "Learn at your own pace with flexible scheduling" }
  ];

  return (
    <div className="homepage-container">
      {/* Fullscreen Carousel Section */}
      <div ref={carouselRef} className="homepage-carousel-section">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`homepage-carousel-slide ${index === currentSlide ? 'homepage-carousel-slide-active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${slide.image})`
            }}
          >
            <div className="homepage-carousel-content">
              <h1 className="homepage-carousel-title animate-slide-up">{slide.title}</h1>
              <p className="homepage-carousel-subtitle animate-slide-up">{slide.subtitle}</p>
              <div className="homepage-carousel-buttons animate-slide-up">
                {!user ? (
                  <>
                    <button onClick={() => navigate('/register')} className="homepage-btn homepage-btn-secondary homepage-btn-lg">
                      Get Started
                    </button>
                    <button onClick={() => navigate('/login')} className="homepage-btn homepage-btn-outline homepage-btn-lg">
                      Login
                    </button>
                  </>
                ) : (
                  <button onClick={() => {
                    const profileType = localStorage.getItem('profile_type');
                    navigate(`/${profileType}/dashboard`);
                  }} className="homepage-btn homepage-btn-secondary homepage-btn-lg">
                    Go to Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Dots */}
        <div className="homepage-carousel-dots">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              className={`homepage-carousel-dot ${index === currentSlide ? 'homepage-carousel-dot-active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="homepage-features-section">
        <div className="homepage-container-inner">
          <h2 className="homepage-section-title">Why Choose LearnHub?</h2>
          <p className="homepage-section-subtitle">We provide the best learning experience with modern tools</p>
          
          <div className="homepage-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="homepage-feature-card animate-fade-in">
                <div className="homepage-feature-icon">{feature.icon}</div>
                <h3 className="homepage-feature-title">{feature.title}</h3>
                <p className="homepage-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section with animated counters */}
      <div ref={statsRef} className="homepage-stats-section">
        <div className="homepage-container-inner">
          <div className="homepage-stats-grid">
            <div className="homepage-stat-item">
              <div className="homepage-stat-number">
                {studentCount.toLocaleString()}+
              </div>
              <div className="homepage-stat-label">Active Students</div>
            </div>
            <div className="homepage-stat-item">
              <div className="homepage-stat-number">
                {teacherCount.toLocaleString()}+
              </div>
              <div className="homepage-stat-label">Expert Teachers</div>
            </div>
            <div className="homepage-stat-item">
              <div className="homepage-stat-number">
                {courseCount.toLocaleString()}+
              </div>
              <div className="homepage-stat-label">Courses Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Component */}
      <Mission />

      {/* Testimonial Component */}
      <Testimonial />

      {/* See More Button - only shows when in carousel section */}
      {showSeeMore && (
        <button onClick={handleSeeMore} className="homepage-see-more-btn">
          <span>See More</span>
          <svg className="homepage-see-more-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Learn More Component */}
      <LearnMore />
      
      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Homepage;