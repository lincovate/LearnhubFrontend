import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { name: "About Us", path: "/about" },
      { name: "How It Works", path: "/More" },
      { name: "Pricing", path: "/pricing" },
      { name: "Success Stories", path: "/success-stories" }
    ],
    Resources: [
      { name: "Blog", path: "/blog" },
      { name: "Help Center", path: "/help" },
      { name: "Community", path: "/community" },
      { name: "Webinars", path: "/webinars" }
    ],
    Legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Accessibility", path: "/accessibility" }
    ]
  };

  const socialLinks = [
    { name: "Facebook", icon: "📘", url: "https://facebook.com" },
    { name: "Twitter", icon: "🐦", url: "https://twitter.com" },
    { name: "LinkedIn", icon: "🔗", url: "https://linkedin.com" },
    { name: "Instagram", icon: "📷", url: "https://instagram.com" },
    { name: "YouTube", icon: "📺", url: "https://youtube.com" }
  ];

  return (
    <footer className="footer-container">
      <div className="footer-wave">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="footer-wave-fill"></path>
        </svg>
      </div>

      <div className="footer-wrapper">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">📚</span>
              <span className="footer-logo-text">LearnHub</span>
            </div>
            <p className="footer-description">
              Transforming education through innovation and accessibility. 
              Empowering learners worldwide to achieve their dreams.
            </p>
            <div className="footer-social">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="footer-links">
              <h3 className="footer-links-title">{category}</h3>
              <ul className="footer-links-list">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link to={link.path} className="footer-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <h3 className="footer-links-title">Newsletter</h3>
            <p className="footer-newsletter-text">
              Get the latest updates and learning tips straight to your inbox.
            </p>
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="footer-newsletter-input"
                required
              />
              <button type="submit" className="footer-newsletter-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
            <p className="footer-newsletter-note">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} LearnHub. All rights reserved.
            </p>
            <div className="footer-payment">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>PayPal</span>
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;