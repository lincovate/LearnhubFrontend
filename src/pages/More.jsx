import React, { useEffect, useRef, useState } from 'react';
import './More.css';

const More = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeUserType, setActiveUserType] = useState('student');
  const [isStarted, setIsStarted] = useState(false);
  const sectionRef = useRef(null);
  const topRef = useRef(null);

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

  // Scroll to top when page loads
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const studentSteps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Fill in your personal details including name, email, phone number, and registration number. Choose a secure password for your account.",
      action: "Fill registration form",
      response: "You'll receive a welcome email with verification link",
      responseType: "Email confirmation",
      icon: "📝",
      color: "#667eea",
      screenPreview: {
        type: "register",
        fields: ["First Name", "Last Name", "Email", "Phone Number", "Registration Number", "Password"],
        action: "Create Account"
      },
      do: [
        "Use a valid email address",
        "Create a strong password",
        "Save your registration number"
      ],
      dont: [
        "Use fake information",
        "Share your password",
        "Skip email verification"
      ]
    },
    {
      number: 2,
      title: "Complete Your Profile",
      description: "After registration, complete your profile with additional information like address and contact details.",
      action: "Update profile information",
      response: "Profile completeness status updated",
      responseType: "Profile verified",
      icon: "👤",
      color: "#f59e0b",
      screenPreview: {
        type: "profile",
        fields: ["Profile Picture", "Address", "Phone Number", "Bio"],
        action: "Save Profile"
      },
      do: [
        "Add a profile picture",
        "Keep contact info updated",
        "Verify your phone number"
      ],
      dont: [
        "Leave mandatory fields empty",
        "Use temporary addresses",
        "Ignore profile verification"
      ]
    },
    {
      number: 3,
      title: "Browse Available Courses",
      description: "Explore our wide range of courses across different categories. Choose up to 2 courses that match your interests.",
      action: "Select your preferred courses",
      response: "Course catalog with 1000+ options",
      responseType: "Course list",
      icon: "🔍",
      color: "#10b981",
      screenPreview: {
        type: "courses",
        courses: ["Full Stack Development", "Data Science Masterclass", "Business Intelligence", "Product Management", "Digital Marketing"],
        action: "Select Course"
      },
      do: [
        "Read course descriptions",
        "Check course prerequisites",
        "Review course syllabus"
      ],
      dont: [
        "Select more than 2 courses",
        "Ignore course requirements",
        "Rush through selection"
      ]
    },
    {
      number: 4,
      title: "Enroll in Courses",
      description: "Officially enroll in your selected courses. Maximum 2 courses allowed per student for quality learning.",
      action: "Confirm course enrollment",
      response: "Enrollment confirmation and access granted",
      responseType: "Enrollment approved",
      icon: "🎯",
      color: "#ef4444",
      screenPreview: {
        type: "enrollment",
        selected: ["Full Stack Development"],
        action: "Confirm Enrollment"
      },
      do: [
        "Review enrollment carefully",
        "Check enrollment deadlines",
        "Confirm your selection twice"
      ],
      dont: [
        "Enroll without planning",
        "Forget enrollment deadlines",
        "Change courses frequently"
      ]
    },
    {
      number: 5,
      title: "Start Learning!",
      description: "Access course materials, join live sessions, and interact with teachers. Track your progress through the dashboard.",
      action: "Begin your learning journey",
      response: "Full access to courses and resources",
      responseType: "Learning access",
      icon: "🎓",
      color: "#8b5cf6",
      screenPreview: {
        type: "dashboard",
        modules: ["Course Materials", "Live Sessions", "Assignments", "Progress Tracker"],
        action: "Start Learning"
      },
      do: [
        "Attend all classes",
        "Complete assignments on time",
        "Participate in discussions"
      ],
      dont: [
        "Skip important lectures",
        "Miss assignment deadlines",
        "Ignore teacher feedback"
      ]
    }
  ];

  const teacherSteps = [
    {
      number: 1,
      title: "Create Teacher Account",
      description: "Register with your professional details including employee ID, department, and teaching experience.",
      action: "Submit teacher application",
      response: "Application received and under review",
      responseType: "Application submitted",
      icon: "👨‍🏫",
      color: "#667eea",
      screenPreview: {
        type: "teacher_register",
        fields: ["Full Name", "Email", "Employee ID", "Department", "Years of Experience", "Password"],
        action: "Register as Teacher"
      },
      do: [
        "Provide valid employee ID",
        "Verify teaching credentials",
        "Use professional email"
      ],
      dont: [
        "Submit incomplete information",
        "Falsify experience",
        "Use personal email"
      ]
    },
    {
      number: 2,
      title: "Admin Approval Process",
      description: "Your application will be reviewed by our admin team. This ensures quality education standards.",
      action: "Wait for approval",
      response: "Approval notification within 24-48 hours",
      responseType: "Pending approval",
      icon: "✅",
      color: "#f59e0b",
      screenPreview: {
        type: "approval",
        status: "Under Review",
        message: "Your application is being processed by our admin team",
        action: "Check Status"
      },
      do: [
        "Check email regularly",
        "Prepare teaching materials",
        "Complete verification calls"
      ],
      dont: [
        "Submit multiple applications",
        "Ignore admin queries",
        "Provide false documents"
      ]
    },
    {
      number: 3,
      title: "Select Courses to Teach",
      description: "Once approved, choose the courses you want to teach. You can select courses based on your expertise.",
      action: "Choose teaching courses",
      response: "Course assignment confirmation",
      responseType: "Course assigned",
      icon: "📚",
      color: "#10b981",
      screenPreview: {
        type: "teacher_courses",
        courses: ["Web Development", "Python Programming", "Data Analytics", "Cloud Computing", "Mobile Development"],
        action: "Assign to Course"
      },
      do: [
        "Select your expertise areas",
        "Review course curriculum",
        "Prepare course schedule"
      ],
      dont: [
        "Choose unfamiliar subjects",
        "Overload your schedule",
        "Ignore course prerequisites"
      ]
    },
    {
      number: 4,
      title: "Complete Teacher Profile",
      description: "Set up your teacher profile with qualifications, experience, and office location for student reference.",
      action: "Build teacher portfolio",
      response: "Profile visible to students",
      responseType: "Profile published",
      icon: "📝",
      color: "#ef4444",
      screenPreview: {
        type: "teacher_profile",
        fields: ["Profile Picture", "Bio", "Qualifications", "Office Location", "Office Hours"],
        action: "Publish Profile"
      },
      do: [
        "Add professional qualifications",
        "Upload your photo",
        "Set office hours"
      ],
      dont: [
        "Leave profile incomplete",
        "Skip important sections",
        "Set unrealistic office hours"
      ]
    },
    {
      number: 5,
      title: "Start Teaching!",
      description: "Access your teacher dashboard, create course content, and begin interacting with enrolled students.",
      action: "Begin teaching",
      response: "Full teaching privileges granted",
      responseType: "Teaching access",
      icon: "💡",
      color: "#8b5cf6",
      screenPreview: {
        type: "teacher_dashboard",
        modules: ["Course Content", "Student Management", "Assignment Review", "Analytics"],
        action: "Start Teaching"
      },
      do: [
        "Upload course materials",
        "Respond to student queries",
        "Track student progress"
      ],
      dont: [
        "Delay content upload",
        "Ignore student questions",
        "Miss scheduled classes"
      ]
    }
  ];

  const currentSteps = activeUserType === 'student' ? studentSteps : teacherSteps;
  const currentStepData = currentSteps[activeStep];

  const handleNext = () => {
    if (activeStep < currentSteps.length - 1) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleFinish = () => {
    alert('Thank you for reviewing the process! You can now proceed to registration.');
  };

  const renderScreenPreview = () => {
    const preview = currentStepData.screenPreview;
    
    if (preview.type === 'register' || preview.type === 'teacher_register') {
      return (
        <div className="more-screen-preview">
          <div className="more-screen-header">
            <div className="more-screen-dots">
              <span className="more-screen-dot more-screen-dot-red"></span>
              <span className="more-screen-dot more-screen-dot-yellow"></span>
              <span className="more-screen-dot more-screen-dot-green"></span>
            </div>
            <span className="more-screen-title">{preview.type === 'register' ? 'Create Account' : 'Teacher Registration'}</span>
          </div>
          <div className="more-screen-body">
            {preview.fields.map((field, idx) => (
              <div key={idx} className="more-screen-field">
                <label>{field}</label>
                <div className="more-screen-input"></div>
              </div>
            ))}
            <button className="more-screen-btn">{preview.action}</button>
          </div>
        </div>
      );
    }
    
    if (preview.type === 'profile' || preview.type === 'teacher_profile') {
      return (
        <div className="more-screen-preview">
          <div className="more-screen-header">
            <div className="more-screen-dots">
              <span className="more-screen-dot more-screen-dot-red"></span>
              <span className="more-screen-dot more-screen-dot-yellow"></span>
              <span className="more-screen-dot more-screen-dot-green"></span>
            </div>
            <span className="more-screen-title">Profile Settings</span>
          </div>
          <div className="more-screen-body">
            <div className="more-screen-avatar"></div>
            {preview.fields.slice(1).map((field, idx) => (
              <div key={idx} className="more-screen-field">
                <label>{field}</label>
                <div className="more-screen-input"></div>
              </div>
            ))}
            <button className="more-screen-btn">{preview.action}</button>
          </div>
        </div>
      );
    }
    
    if (preview.type === 'courses' || preview.type === 'teacher_courses') {
      return (
        <div className="more-screen-preview">
          <div className="more-screen-header">
            <div className="more-screen-dots">
              <span className="more-screen-dot more-screen-dot-red"></span>
              <span className="more-screen-dot more-screen-dot-yellow"></span>
              <span className="more-screen-dot more-screen-dot-green"></span>
            </div>
            <span className="more-screen-title">Available Courses</span>
          </div>
          <div className="more-screen-body">
            {preview.courses.slice(0, 3).map((course, idx) => (
              <div key={idx} className="more-screen-course">
                <div className="more-screen-checkbox"></div>
                <span>{course}</span>
              </div>
            ))}
            <button className="more-screen-btn">{preview.action}</button>
          </div>
        </div>
      );
    }
    
    if (preview.type === 'enrollment') {
      return (
        <div className="more-screen-preview">
          <div className="more-screen-header">
            <div className="more-screen-dots">
              <span className="more-screen-dot more-screen-dot-red"></span>
              <span className="more-screen-dot more-screen-dot-yellow"></span>
              <span className="more-screen-dot more-screen-dot-green"></span>
            </div>
            <span className="more-screen-title">Enrollment Confirmation</span>
          </div>
          <div className="more-screen-body">
            <div className="more-screen-selected">
              <span>Selected Course:</span>
              <strong>{preview.selected[0]}</strong>
            </div>
            <button className="more-screen-btn">{preview.action}</button>
          </div>
        </div>
      );
    }
    
    if (preview.type === 'dashboard' || preview.type === 'teacher_dashboard') {
      return (
        <div className="more-screen-preview">
          <div className="more-screen-header">
            <div className="more-screen-dots">
              <span className="more-screen-dot more-screen-dot-red"></span>
              <span className="more-screen-dot more-screen-dot-yellow"></span>
              <span className="more-screen-dot more-screen-dot-green"></span>
            </div>
            <span className="more-screen-title">Dashboard</span>
          </div>
          <div className="more-screen-body">
            {preview.modules.map((module, idx) => (
              <div key={idx} className="more-screen-module">
                <span>{module}</span>
              </div>
            ))}
            <button className="more-screen-btn">{preview.action}</button>
          </div>
        </div>
      );
    }
    
    if (preview.type === 'approval') {
      return (
        <div className="more-screen-preview">
          <div className="more-screen-header">
            <div className="more-screen-dots">
              <span className="more-screen-dot more-screen-dot-red"></span>
              <span className="more-screen-dot more-screen-dot-yellow"></span>
              <span className="more-screen-dot more-screen-dot-green"></span>
            </div>
            <span className="more-screen-title">Application Status</span>
          </div>
          <div className="more-screen-body">
            <div className="more-screen-status">
              <div className="more-screen-status-badge">{preview.status}</div>
              <p>{preview.message}</p>
            </div>
            <button className="more-screen-btn">{preview.action}</button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (!isStarted) {
    return (
      <div ref={topRef} className="more-container">
        <div className="more-background">
          <div className="more-bg-particle more-bg-particle-1"></div>
          <div className="more-bg-particle more-bg-particle-2"></div>
          <div className="more-bg-particle more-bg-particle-3"></div>
        </div>
        <div className="more-start-screen">
          <div className="more-start-content">
            <div className="more-start-icon">🚀</div>
            <h2>Ready to Begin Your Journey?</h2>
            <p>Explore the step-by-step guide to joining our learning platform</p>
            <div className="more-toggle-start">
              <button 
                className={`more-start-toggle ${activeUserType === 'student' ? 'more-start-toggle-active' : ''}`}
                onClick={() => setActiveUserType('student')}
              >
                🎓 Student Path
              </button>
              <button 
                className={`more-start-toggle ${activeUserType === 'teacher' ? 'more-start-toggle-active' : ''}`}
                onClick={() => setActiveUserType('teacher')}
              >
                👨‍🏫 Teacher Path
              </button>
            </div>
            <button className="more-start-btn" onClick={handleStart}>
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="more-container">
      <div className="more-background">
        <div className="more-bg-particle more-bg-particle-1"></div>
        <div className="more-bg-particle more-bg-particle-2"></div>
        <div className="more-bg-particle more-bg-particle-3"></div>
      </div>

      <div className="more-wrapper">
        <div className="more-header">
          <span className="more-badge">How to Join</span>
          <h2 className="more-title">Your Journey to Learning Begins Here</h2>
          <p className="more-subtitle">
            Follow these steps to become part of our community
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="more-toggle-container">
          <button 
            className={`more-toggle-btn ${activeUserType === 'student' ? 'more-toggle-active' : ''}`}
            onClick={() => {
              setActiveUserType('student');
              setActiveStep(0);
            }}
          >
            <span className="more-toggle-icon">🎓</span>
            <span>Student Path</span>
          </button>
          <button 
            className={`more-toggle-btn ${activeUserType === 'teacher' ? 'more-toggle-active' : ''}`}
            onClick={() => {
              setActiveUserType('teacher');
              setActiveStep(0);
            }}
          >
            <span className="more-toggle-icon">👨‍🏫</span>
            <span>Teacher Path</span>
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="more-two-column">
          {/* Left Column - Screen Preview */}
          <div className="more-left-column">
            <div className="more-screen-container">
              <div className="more-screen-label">Screen Preview</div>
              {renderScreenPreview()}
            </div>
          </div>

          {/* Right Column - Step Details */}
          <div className="more-right-column">
            <div className="more-steps-container">
              {/* Step Navigation */}
              <div className="more-step-nav">
                {currentSteps.map((step, index) => (
                  <button
                    key={index}
                    className={`more-step-dot ${activeStep === index ? 'more-step-dot-active' : ''}`}
                    onClick={() => setActiveStep(index)}
                    style={{ '--step-color': step.color }}
                  >
                    <span className="more-step-number">{step.number}</span>
                  </button>
                ))}
              </div>

              {/* Step Content */}
              <div className={`more-step-card ${isVisible ? 'more-step-animate' : ''}`}>
                <div className="more-step-card-glossy"></div>
                
                <div className="more-step-header" style={{ background: `linear-gradient(135deg, ${currentStepData.color}20, ${currentStepData.color}40)` }}>
                  <div className="more-step-icon" style={{ background: currentStepData.color }}>
                    <span>{currentStepData.icon}</span>
                  </div>
                  <div className="more-step-title-section">
                    <span className="more-step-badge">Step {currentStepData.number}</span>
                    <h3 className="more-step-title">{currentStepData.title}</h3>
                  </div>
                </div>

                <div className="more-step-body">
                  <p className="more-step-description">{currentStepData.description}</p>
                  
                  <div className="more-step-action">
                    <div className="more-action-box">
                      <span className="more-action-label">Action Required</span>
                      <span className="more-action-text">{currentStepData.action}</span>
                    </div>
                    <div className="more-response-box">
                      <span className="more-response-label">You Will Receive</span>
                      <span className="more-response-text">{currentStepData.response}</span>
                    </div>
                  </div>

                  <div className="more-step-rules">
                    <div className="more-do-section">
                      <h4 className="more-do-title">Do's</h4>
                      <ul className="more-rule-list">
                        {currentStepData.do.map((item, idx) => (
                          <li key={idx}>
                            <svg className="more-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="more-dont-section">
                      <h4 className="more-dont-title">Don'ts</h4>
                      <ul className="more-rule-list">
                        {currentStepData.dont.map((item, idx) => (
                          <li key={idx}>
                            <svg className="more-x-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="more-navigation-buttons">
                <button 
                  className="more-nav-btn more-nav-back" 
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                
                <div className="more-step-progress">
                  <div className="more-progress-bar">
                    <div 
                      className="more-progress-fill" 
                      style={{ 
                        width: `${((activeStep + 1) / currentSteps.length) * 100}%`,
                        background: `linear-gradient(90deg, ${currentStepData.color}, ${currentStepData.color}dd)`
                      }}
                    />
                  </div>
                  <p className="more-progress-text">
                    Step {activeStep + 1} of {currentSteps.length}
                  </p>
                </div>

                {activeStep === currentSteps.length - 1 ? (
                  <button className="more-nav-btn more-nav-finish" onClick={handleFinish}>
                    Finish
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                ) : (
                  <button className="more-nav-btn more-nav-next" onClick={handleNext}>
                    Next
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="more-summary">
          <div className="more-summary-card">
            <div className="more-summary-icon">⏱️</div>
            <div className="more-summary-content">
              <h4>Total Time</h4>
              <p>~15 minutes to complete all steps</p>
            </div>
          </div>
          <div className="more-summary-card">
            <div className="more-summary-icon">✅</div>
            <div className="more-summary-content">
              <h4>Success Rate</h4>
              <p>98% of applicants complete successfully</p>
            </div>
          </div>
          <div className="more-summary-card">
            <div className="more-summary-icon">📧</div>
            <div className="more-summary-content">
              <h4>Support</h4>
              <p>24/7 support available for any issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default More;