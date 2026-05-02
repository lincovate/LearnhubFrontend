import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const pricingPlans = {
    freelancer: {
      name: "Freelancer Teacher",
      icon: "👨‍🏫",
      description: "Perfect for independent teachers managing their own students",
      features: [
        "Pay per student enrolled",
        "Access to course management tools",
        "Student progress tracking",
        "Attendance verification system",
        "Revenue analytics dashboard",
        "Announcement and communication tools",

      ],
      price: {
        monthly: { amount: 29, perStudent: 4 },
        yearly: { amount: 290, perStudent: 4 }
      },
      buttonText: "Start Teaching",
      popular: false
    },
    school: {
      name: "School/Institution",
      icon: "🏫",
      description: "Complete solution for schools and educational institutions",
      features: [
        "Unlimited teachers and students",
        "Full course management suite",
        "Bulk enrollment system",
        "Attendance tracking for all classes",
        "Advanced analytics & reporting",
        "Priority support & training",
        "Custom branding options",
        "API access"
      ],
      price: {
        monthly: { amount: 299, perStudent: 3 },
        yearly: { amount: 2990, perStudent: 2.5 }
      },
      buttonText: "Contact Sales",
      popular: true
    },
    student: {
      name: "Individual Student",
      icon: "🎓",
      description: "For learners who want to take specific courses",
      features: [
        "Access to enrolled courses only",
        "Teacher attendance verification",
        "Course completion tracking",
        "Progress reports",
        "Community access",
        "Certificate upon completion"
      ],
      price: {
        monthly: { amount: 49, perCourse: 0 },
        yearly: { amount: 490, perCourse: 0 }
      },
      buttonText: "Enroll Now",
      popular: false,
      note: "Price varies by course. Contact for custom pricing."
    }
  };

  const attendancePolicy = [
    {
      title: "Attendance Requirement",
      description: "Students must maintain minimum 75% attendance to remain enrolled in the course.",
      icon: "📊"
    },
    {
      title: "Verification Process",
      description: "Teachers verify student attendance through digital check-ins and participation tracking.",
      icon: "✅"
    },
    {
      title: "Removal Policy",
      description: "Students with attendance below requirement will be removed from the course after notification.",
      icon: "⚠️"
    },
    {
      title: "Re-enrollment",
      description: "Removed students can re-enroll in the next semester with proper attendance commitment.",
      icon: "🔄"
    }
  ];

  const handleContactClick = () => {
    window.location.href = 'mailto:info@lincovate.com';
  };

  const handleGetStarted = (planName) => {
    setSelectedPlan(planName);
    // Scroll to contact section
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-background">
        <div className="pricing-bg-shape pricing-bg-shape-1"></div>
        <div className="pricing-bg-shape pricing-bg-shape-2"></div>
        <div className="pricing-bg-shape pricing-bg-shape-3"></div>
      </div>

      <div className="pricing-wrapper">
        {/* Header */}
        <div className="pricing-header">
          <span className="pricing-badge">Pricing Plans</span>
          <h1 className="pricing-title">Simple, Transparent Pricing</h1>
          <p className="pricing-subtitle">
            Choose the perfect plan for your learning journey. All plans include access to LearnHub's core features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="pricing-toggle-container">
          <button 
            className={`pricing-toggle-btn ${billingCycle === 'monthly' ? 'pricing-toggle-active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly Billing
          </button>
          <button 
            className={`pricing-toggle-btn ${billingCycle === 'yearly' ? 'pricing-toggle-active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly Billing
            <span className="pricing-save-badge">Save 20%</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {Object.entries(pricingPlans).map(([key, plan]) => (
            <div key={key} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
              {plan.popular && <div className="pricing-popular-badge">Most Popular</div>}
              
              <div className="pricing-card-icon">{plan.icon}</div>
              <h3 className="pricing-plan-name">{plan.name}</h3>
              <p className="pricing-plan-description">{plan.description}</p>
              
              <div className="pricing-price-container">
                <span className="pricing-currency">$</span>
                <span className="pricing-amount">{plan.price[billingCycle].amount}</span>
                <span className="pricing-period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              {plan.price[billingCycle].perStudent > 0 && (
                <div className="pricing-per-student">
                  + ${plan.price[billingCycle].perStudent} per student
                </div>
              )}
              
              {plan.note && <div className="pricing-note">{plan.note}</div>}
              
              <ul className="pricing-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <svg className="pricing-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`pricing-btn ${plan.popular ? 'pricing-btn-primary' : 'pricing-btn-secondary'}`}
                onClick={() => handleGetStarted(plan.name)}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Attendance Policy Section */}
        <div className="pricing-attendance-section">
          <h2 className="pricing-section-title">Attendance & Enrollment Policy</h2>
          <p className="pricing-section-subtitle">
            LearnHub maintains high-quality learning standards through our attendance verification system
          </p>
          
          <div className="pricing-attendance-grid">
            {attendancePolicy.map((policy, idx) => (
              <div key={idx} className="pricing-attendance-card">
                <div className="pricing-attendance-icon">{policy.icon}</div>
                <h4>{policy.title}</h4>
                <p>{policy.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Price Note */}
        <div className="pricing-market-note">
          <div className="pricing-market-icon">💰</div>
          <h3>Market Competitive Pricing</h3>
          <p>
            Our prices are benchmarked against industry standards to ensure you get the best value. 
            All prices are quoted under LearnHub's transparent pricing model.
          </p>
        </div>

        {/* Contact Section for Negotiations */}
        <div id="contact-section" className="pricing-contact-section">
          <div className="pricing-contact-content">
            <div className="pricing-contact-icon">📧</div>
            <h3>Need Custom Pricing?</h3>
            <p>
              For bulk enrollments, institutional partnerships, or special arrangements, 
              we offer customized pricing plans tailored to your needs.
            </p>
            <button onClick={handleContactClick} className="pricing-contact-btn">
              Contact Us at info@lincovate.com
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <p className="pricing-contact-note">
              Our team will respond within 24 hours to discuss your requirements
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pricing-faq-section">
          <h2 className="pricing-section-title">Frequently Asked Questions</h2>
          <div className="pricing-faq-grid">
            <div className="pricing-faq-item">
              <h4>How does teacher payment work?</h4>
              <p>Freelancer teachers pay per student enrolled in their courses. Schools pay a flat fee plus per-student charges.</p>
            </div>
            <div className="pricing-faq-item">
              <h4>What happens if a student's attendance is low?</h4>
              <p>Teachers verify attendance regularly. Students with attendance below 75% receive a warning, then are removed from the course.</p>
            </div>
            <div className="pricing-faq-item">
              <h4>Can I change my plan later?</h4>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.</p>
            </div>
            <div className="pricing-faq-item">
              <h4>Is there a free trial?</h4>
              <p>Yes, we offer a 14-day free trial for all plans. No credit card required to start.</p>
            </div>
            <div className="pricing-faq-item">
              <h4>How are students verified?</h4>
              <p>Teachers verify attendance through digital check-ins, participation tracking, and completion of assignments.</p>
            </div>
            <div className="pricing-faq-item">
              <h4>What payment methods are accepted?</h4>
              <p>We accept all major credit cards, PayPal, and bank transfers for institutional plans.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="pricing-cta">
          <div className="pricing-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of educators and learners on LearnHub today</p>
            <div className="pricing-cta-buttons">
              <Link to="/register" className="pricing-cta-btn pricing-cta-primary">Start Free Trial</Link>
              <button onClick={handleContactClick} className="pricing-cta-btn pricing-cta-secondary">Contact Sales</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;