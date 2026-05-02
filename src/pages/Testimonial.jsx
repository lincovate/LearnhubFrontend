import React, { useEffect, useRef, useState } from 'react';
import './Testimonial.css';

const Testimonial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const sectionRef = useRef(null);
  const autoRotateRef = useRef(null);

  const studentTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Software Engineer",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      text: "LearnHub transformed my career! The courses are well-structured and the teachers are incredibly supportive. I landed my dream job within 3 months of starting.",
      rating: 5,
      course: "Full Stack Development"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Scientist",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      text: "The flexibility and quality of content is unmatched. Being able to learn at my own pace while working full-time made all the difference.",
      rating: 5,
      course: "Data Science Masterclass"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Business Analyst",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      text: "The interactive learning approach and community support are fantastic. I've recommended LearnHub to all my colleagues!",
      rating: 5,
      course: "Business Intelligence"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Product Manager",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      text: "The practical projects and real-world examples made learning so much easier. I've gained skills that I use daily at work.",
      rating: 5,
      course: "Product Management"
    },
    {
      id: 5,
      name: "Lisa Thompson",
      role: "Marketing Director",
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      text: "Best investment I've made in my professional development. The community support and teacher feedback are exceptional.",
      rating: 5,
      course: "Digital Marketing"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "DevOps Engineer",
      image: "https://randomuser.me/api/portraits/men/6.jpg",
      text: "The practical approach and real-world projects helped me land a job at a top tech company. Highly recommended!",
      rating: 5,
      course: "DevOps Fundamentals"
    }
  ];

  const teacherTestimonials = [
    {
      id: 1,
      name: "Dr. James Wilson",
      role: "Senior CS Professor",
      image: "https://randomuser.me/api/portraits/men/11.jpg",
      text: "Teaching on LearnHub has been incredibly rewarding. The platform's tools make it easy to engage with students and track their progress effectively.",
      rating: 5,
      experience: "15+ years",
      subject: "Computer Science"
    },
    {
      id: 2,
      name: "Prof. Maria Garcia",
      role: "Data Science Expert",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      text: "I love how LearnHub empowers teachers to create impactful content. The students are motivated and the community is truly special.",
      rating: 5,
      experience: "10+ years",
      subject: "Data Science"
    },
    {
      id: 3,
      name: "Dr. Robert Chen",
      role: "AI Researcher",
      image: "https://randomuser.me/api/portraits/men/13.jpg",
      text: "The platform's analytics help me understand my students' needs better. It's a game-changer for online education.",
      rating: 5,
      experience: "12+ years",
      subject: "Artificial Intelligence"
    },
    {
      id: 4,
      name: "Prof. Sarah Adams",
      role: "Business Strategy",
      image: "https://randomuser.me/api/portraits/women/14.jpg",
      text: "LearnHub provides the perfect environment for sharing knowledge. The support from the team is outstanding.",
      rating: 5,
      experience: "8+ years",
      subject: "Business Strategy"
    },
    {
      id: 5,
      name: "Dr. Michael Lee",
      role: "Cybersecurity Expert",
      image: "https://randomuser.me/api/portraits/men/15.jpg",
      text: "The interactive features and student engagement tools are top-notch. Highly recommended for educators.",
      rating: 5,
      experience: "20+ years",
      subject: "Cybersecurity"
    },
    {
      id: 6,
      name: "Prof. Anna White",
      role: "UX Design Lead",
      image: "https://randomuser.me/api/portraits/women/16.jpg",
      text: "Teaching on LearnHub has allowed me to reach students globally. The platform's design tools are fantastic for creating engaging content.",
      rating: 5,
      experience: "9+ years",
      subject: "UI/UX Design"
    }
  ];

  const currentTestimonials = activeTab === 'students' ? studentTestimonials : teacherTestimonials;
  const visibleTestimonials = currentTestimonials.slice(currentStartIndex, currentStartIndex + 3);
  const totalGroups = Math.ceil(currentTestimonials.length / 3);
  const currentGroup = Math.floor(currentStartIndex / 3) + 1;

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

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (!isVisible) return;

    autoRotateRef.current = setInterval(() => {
      handleNext();
    }, 8000);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isVisible, currentStartIndex, currentTestimonials.length]);

  const handleNext = () => {
    const newStartIndex = currentStartIndex + 3;
    if (newStartIndex < currentTestimonials.length) {
      setCurrentStartIndex(newStartIndex);
    } else {
      setCurrentStartIndex(0);
    }
  };

  const handlePrev = () => {
    const newStartIndex = currentStartIndex - 3;
    if (newStartIndex >= 0) {
      setCurrentStartIndex(newStartIndex);
    } else {
      setCurrentStartIndex(Math.max(0, currentTestimonials.length - 3));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentStartIndex(0);
  };

  const goToGroup = (groupIndex) => {
    setCurrentStartIndex(groupIndex * 3);
  };

  return (
    <div ref={sectionRef} className="testimonial-container">
      <div className="testimonial-background">
        <div className="testimonial-bg-circle testimonial-bg-circle-1"></div>
        <div className="testimonial-bg-circle testimonial-bg-circle-2"></div>
        <div className="testimonial-bg-circle testimonial-bg-circle-3"></div>
      </div>

      <div className="testimonial-wrapper">
        <div className="testimonial-header">
          <span className="testimonial-badge">Testimonials</span>
          <h2 className="testimonial-title">What Our Community Says</h2>
          <p className="testimonial-subtitle">
            Real stories from real people
          </p>
        </div>

        {/* Tab Bar */}
        <div className="testimonial-tab-bar">
          <button 
            className={`testimonial-tab ${activeTab === 'students' ? 'testimonial-tab-active' : ''}`}
            onClick={() => handleTabChange('students')}
          >
            <span className="testimonial-tab-icon"></span>
            <span className="testimonial-tab-text">Students</span>
            <span className="testimonial-tab-count">{studentTestimonials.length}</span>
          </button>
          <button 
            className={`testimonial-tab ${activeTab === 'teachers' ? 'testimonial-tab-active' : ''}`}
            onClick={() => handleTabChange('teachers')}
          >
            <span className="testimonial-tab-icon"></span>
            <span className="testimonial-tab-text">Teachers</span>
            <span className="testimonial-tab-count">{teacherTestimonials.length}</span>
          </button>
        </div>

        {/* Navigation Arrows */}
        <button 
          className="testimonial-nav testimonial-nav-prev"
          onClick={handlePrev}
          aria-label="Previous"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          className="testimonial-nav testimonial-nav-next"
          onClick={handleNext}
          aria-label="Next"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Testimonials Grid - 3 cards */}
        <div className="testimonial-grid">
          {visibleTestimonials.map((testimonial, idx) => (
            <div 
              key={testimonial.id} 
              className={`testimonial-card ${isVisible ? `testimonial-animate-${idx + 1}` : ''}`}
            >
              <div className="testimonial-quote-icon">"</div>
              
              <div className="testimonial-content">
                <p className="testimonial-text">{testimonial.text}</p>
                
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="testimonial-author-image"
                  />
                  <div className="testimonial-author-info">
                    <h4 className="testimonial-author-name">{testimonial.name}</h4>
                    <p className="testimonial-author-role">{testimonial.role}</p>
                    {activeTab === 'students' ? (
                      <p className="testimonial-course"> {testimonial.course}</p>
                    ) : (
                      <>
                        <p className="testimonial-experience">⭐ {testimonial.experience}</p>
                        <p className="testimonial-subject"> {testimonial.subject}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="testimonial-star">★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Group Navigation Dots */}
        <div className="testimonial-group-dots">
          {[...Array(totalGroups)].map((_, index) => (
            <button
              key={index}
              className={`testimonial-group-dot ${currentGroup - 1 === index ? 'testimonial-group-dot-active' : ''}`}
              onClick={() => goToGroup(index)}
              aria-label={`Go to group ${index + 1}`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="testimonial-counter">
          Group {currentGroup} of {totalGroups} • {currentTestimonials.length} testimonials
        </div>
      </div>
    </div>
  );
};

export default Testimonial;