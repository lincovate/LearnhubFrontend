import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [requestedCourse, setRequestedCourse] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);

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
      { threshold: 0.1 }
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

  const handleCourseRequest = (e) => {
    e.preventDefault();
    if (requestedCourse.trim()) {
      const existingSuggestions = JSON.parse(localStorage.getItem('courseSuggestions') || '[]');
      const newSuggestion = {
        id: Date.now(),
        course: requestedCourse,
        suggestedAt: new Date().toISOString(),
        status: 'pending'
      };
      existingSuggestions.push(newSuggestion);
      localStorage.setItem('courseSuggestions', JSON.stringify(existingSuggestions));
      
      setRequestSubmitted(true);
      setTimeout(() => setRequestSubmitted(false), 3000);
      setRequestedCourse('');
      setShowCourseModal(true);
      setTimeout(() => setShowCourseModal(false), 3000);
    }
  };

  const handleLearnMoreClick = (e) => {
    e.preventDefault();
    const lincovateSection = document.getElementById('lincovate');
    if (lincovateSection) {
      lincovateSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreCourses = () => {
    navigate('/more');
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    document.body.style.overflow = 'hidden';
  };

  const handleClosePreview = () => {
    setSelectedCourse(null);
    document.body.style.overflow = 'auto';
  };

  // Active courses: Full Stack Development, Electrical Engineering, Biomedical Engineering
  const courses = [
    { name: "Full Stack Web Development", code: "FSWD101", students: 12450, level: "Beginner to Advanced", isActive: true, description: "Master front-end and back-end development with modern technologies including React, Node.js, and MongoDB. Build real-world projects and become a full-stack developer.", duration: "6 months", modules: ["HTML/CSS", "JavaScript", "React", "Node.js", "MongoDB", "Express.js"] },
    { name: "Biomedical Engineering", code: "BME901", students: 3420, level: "Beginner to Advanced", isActive: true, description: "Explore the intersection of engineering and medicine. Learn about medical devices, imaging systems, and healthcare technology.", duration: "5 months", modules: ["Engineering Mathematics 1", "Electrical Principles 1", "Biomechanics", "Medical Instrumentation", "Biomaterials"] },
    { name: "Electrical Engineering", code: "ELE902", students: 4120, level: "Intermediate", isActive: true, description: "Study the fundamentals of electrical systems, circuit analysis, power systems, and electronics. Prepare for a career in the electrical engineering field.", duration: "6 months", modules: ["Engineering Mathematics 1", "Electrical Principles 1", "Circuit Analysis", "Digital Electronics", "Power Systems", "Control Systems"] },
    { name: "Data Science & Machine Learning", code: "DSML201", students: 8920, level: "Intermediate", isActive: false, description: "Coming soon! Learn data analysis, visualization, and machine learning algorithms.", duration: "TBD", modules: [] },
    { name: "Mobile App Development", code: "MAD301", students: 6730, level: "Beginner to Advanced", isActive: false, description: "Coming soon! Build iOS and Android apps using React Native and Flutter.", duration: "TBD", modules: [] },
    { name: "Cloud Computing (AWS/Azure)", code: "CLC401", students: 5420, level: "Intermediate", isActive: false, description: "Coming soon! Master cloud platforms, deployment, and infrastructure management.", duration: "TBD", modules: [] },
    { name: "Cybersecurity Fundamentals", code: "CSF501", students: 4890, level: "Beginner", isActive: false, description: "Coming soon! Learn security principles, network security, and ethical hacking.", duration: "TBD", modules: [] },
    { name: "UI/UX Design", code: "UIX601", students: 7340, level: "Beginner to Advanced", isActive: false, description: "Coming soon! Master user interface and user experience design principles.", duration: "TBD", modules: [] }
  ];

  return (
    <div ref={sectionRef} className="about-container">
      <div className="about-background">
        <div className="about-bg-shape about-bg-shape-1"></div>
        <div className="about-bg-shape about-bg-shape-2"></div>
        <div className="about-bg-shape about-bg-shape-3"></div>
      </div>

      <div className="about-wrapper">
        {/* Hero Section */}
        <div className="about-hero">
          <span className="about-badge">About Us</span>
          <h1 className="about-title">Shaping the Future of Education</h1>
          <p className="about-subtitle">
            LearnHub is dedicated to providing accessible, high-quality education 
            that empowers learners worldwide to achieve their dreams.
          </p>
        </div>

        {/* Mission Section with Link */}
        <div className={`about-mission-section ${isVisible ? 'about-animate' : ''}`}>
          <div className="about-mission-content">
            <span className="about-section-tag">Our Mission</span>
            <h2>To Transform Lives Through Education</h2>
            <p>
              We believe that education is the most powerful tool for change. Our mission is to 
              democratize learning by making high-quality education accessible to everyone, 
              regardless of their background or location.
            </p>
            <a href="#lincovate" onClick={handleLearnMoreClick} className="about-mission-link">
              Learn More About Us
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          <div className="about-mission-stats">
            <div className="about-stat">
              <span className="about-stat-number">50K+</span>
              <span className="about-stat-label">Active Learners</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">200+</span>
              <span className="about-stat-label">Expert Teachers</span>
            </div>
            <div className="about-stat">
              <span className="about-stat-number">1000+</span>
              <span className="about-stat-label">Courses</span>
            </div>
          </div>
        </div>

        {/* Founding Company Section with Background Image */}
        <div id="lincovate" className={`about-founding-section ${isVisible ? 'about-animate-delayed' : ''}`}>
          <div className="about-founding-overlay"></div>
          <div className="about-founding-logo">
            <div className="about-lincovate-icon">
              <img src="/images/logo.png" alt="Lincovate Technologies Logo" className="about-lincovate-logo" onError={(e) => {
                e.target.style.display = 'none';
              }} />
            </div>
            <h2>Lincovate Technologies</h2>
            <p className="about-founding-tag">Founding Company & Innovation Partner</p>
          </div>
          <div className="about-founding-content">
            <p>
              Lincovate Technologies is a cutting-edge technology company dedicated to revolutionizing 
              education through innovative digital solutions. With a passion for learning and a commitment 
              to excellence, Lincovate has developed LearnHub as a platform that bridges the gap between 
              traditional education and modern digital learning.
            </p>
            <p>
              Our team of experienced developers, educators, and designers work tirelessly to create 
              an engaging, interactive, and effective learning environment that serves thousands of 
              students and teachers worldwide.
            </p>
            <div className="about-founding-features">
              <div className="about-founding-feature">
                <span>💡</span>
                <span>Innovative Learning Solutions</span>
              </div>
              <div className="about-founding-feature">
                <span>🌍</span>
                <span>Global Reach</span>
              </div>
              <div className="about-founding-feature">
                <span>🤝</span>
                <span>Community Driven</span>
              </div>
              <div className="about-founding-feature">
                <span>📊</span>
                <span>Data-Driven Approach</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Quotes Section */}
        <div className={`about-quotes-section ${isVisible ? 'about-animate-delayed-2' : ''}`}>
          <div className="about-quote-card">
            <div className="about-quote-icon">"</div>
            <p className="about-quote-text">
              Education technology should not just transfer knowledge; it should inspire curiosity 
              and foster a love for learning. At Lincovate, we built LearnHub to create a platform 
              where every student feels supported and every teacher feels empowered.
            </p>
            <div className="about-quote-author">
              <div className="about-quote-avatar">J</div>
              <div className="about-quote-info">
                <h4>Josiah Mwangi</h4>
                <p>Lead Developer, Lincovate Technologies</p>
                <span className="about-quote-role">Full Stack Engineer & Educator</span>
              </div>
            </div>
          </div>

          <div className="about-quote-card">
            <div className="about-quote-icon">"</div>
            <p className="about-quote-text">
              Technology has the power to democratize education. I've seen firsthand how access 
              to quality learning resources can transform careers and lives. LearnHub is my 
              contribution to making world-class education accessible to everyone, everywhere.
            </p>
            <div className="about-quote-author">
              <div className="about-quote-avatar">L</div>
              <div className="about-quote-info">
                <h4>Lucas Gitiriku</h4>
                <p>Senior Software Engineer, Lincovate Technologies</p>
                <span className="about-quote-role">Backend Architect & AI Specialist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className={`about-courses-section ${isVisible ? 'about-animate-delayed-3' : ''}`}>
          <div className="about-courses-header">
            <span className="about-section-tag">Our Courses</span>
            <h2>Explore Our Learning Catalog</h2>
            <p>
              We offer a diverse range of courses designed to meet the needs of modern learners.
              Each course is crafted by industry experts and updated regularly.
            </p>
          </div>

          <div className="about-courses-grid">
            {courses.map((course, index) => (
              <div key={index} className={`about-course-card ${!course.isActive ? 'about-course-coming-soon' : ''}`}>
                <div className="about-course-code">{course.code}</div>
                <h3 className="about-course-name">{course.name}</h3>
                <div className="about-course-stats">
                  <span className="about-course-students">
                    {course.isActive ? `👥 ${course.students.toLocaleString()} students` : '🔜 Coming Soon'}
                  </span>
                  <span className="about-course-level">📊 {course.level}</span>
                </div>
                {course.isActive ? (
                  <div className="about-course-link" onClick={() => handleViewCourse(course)}>
                    View Course →
                  </div>
                ) : (
                  <div className="about-course-notify">
                    <span>📧 Notify me when available</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Course Request Section */}
          <div className="about-course-request">
            <div className="about-request-content">
              <div className="about-request-icon">📢</div>
              <h3>Don't See Your Desired Course?</h3>
              <p>
                We're constantly expanding our catalog. Tell us what course you'd like to see,
                and we'll work on introducing it to our platform!
              </p>
              <form onSubmit={handleCourseRequest} className="about-request-form">
                <input
                  type="text"
                  className="about-request-input"
                  placeholder="Enter course name you'd like to learn..."
                  value={requestedCourse}
                  onChange={(e) => setRequestedCourse(e.target.value)}
                  required
                />
                <button type="submit" className="about-request-btn">
                  Suggest Course
                </button>
              </form>
              {requestSubmitted && (
                <div className="about-request-success">
                  Thank you for your suggestion! We'll review it and consider adding it to our catalog.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="about-cta">
          <div className="about-cta-content">
            <h2>Ready to Start Your Learning Journey?</h2>
            <p>Join thousands of students already learning on LearnHub</p>
            <p><strong><em>Check the registration step by pressing the find out more button</em></strong></p>
            <div className="about-cta-buttons">
              <Link to="/register" className="about-cta-btn about-cta-primary">Get Started Free</Link>
              <button onClick={handleExploreCourses} className="about-cta-btn about-cta-secondary">Find out More</button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <div className="about-course-preview-overlay" onClick={handleClosePreview}>
          <div className="about-course-preview-container" onClick={(e) => e.stopPropagation()}>
            <button className="about-preview-close" onClick={handleClosePreview}>×</button>
            <div className="about-preview-header">
              <span className="about-preview-code">{selectedCourse.code}</span>
              <h2 className="about-preview-title">{selectedCourse.name}</h2>
            </div>
            <div className="about-preview-body">
              <div className="about-preview-description">
                <h4>Course Description</h4>
                <p>{selectedCourse.description}</p>
              </div>
              <div className="about-preview-info">
                <div className="about-preview-info-item">
                  <strong>Duration:</strong> {selectedCourse.duration}
                </div>
                <div className="about-preview-info-item">
                  <strong>Level:</strong> {selectedCourse.level}
                </div>
                <div className="about-preview-info-item">
                  <strong>Students:</strong> {selectedCourse.students.toLocaleString()}+
                </div>
              </div>
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <div className="about-preview-modules">
                  <h4>What You'll Learn</h4>
                  <ul>
                    {selectedCourse.modules.map((module, idx) => (
                      <li key={idx}>{module}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="about-preview-footer">
              <Link to="/register" className="about-preview-btn">Enroll Now</Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal for course suggestion */}
      {showCourseModal && (
        <div className="about-modal">
          <div className="about-modal-content">
            <span className="about-modal-icon">✅</span>
            <h4>Course Suggested!</h4>
            <p>Your suggestion has been recorded. Our team will review it!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;