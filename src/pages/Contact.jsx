// src/components/Contact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import './Contact.css';

const Contact = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    message: ''
  });

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(number);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setPhoneDigits(value);
      setFormData({ ...formData, contact: `+254${value}` });
      if (value && !validatePhoneNumber(value)) {
        setPhoneError('Please enter 9 digits (e.g., 712345678)');
      } else {
        setPhoneError('');
      }
    }
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.contact.trim()) {
      setError('Please enter your contact number');
      return false;
    }
    if (formData.contact && !validatePhoneNumber(phoneDigits)) {
      setError('Please enter a valid 9-digit phone number');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const submitData = {
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      message: formData.message
    };
    
    try {
      const response = await api.submitContact(submitData);
      setSuccess('✓ Message sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        contact: '',
        email: '',
        message: ''
      });
      setPhoneDigits('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (error) {
      console.error('Contact error:', error);
      if (error.response && error.response.data) {
        const errors = error.response.data;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = '254791192398'; // Remove the + and keep the number
    const message = encodeURIComponent(
      "Hello Engineer Mwangi, I have contacted you from LearnHub and I was inquiring about:\n\n" +
      "I would like to get more information about the platform and how I can get started."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+254791192398';
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <div className="contact-header">
          <div className="contact-logo">
            <span className="contact-logo-icon">📧</span>
            <span className="contact-logo-text">Contact Us</span>
          </div>
          <h2 className="contact-title">Get in Touch</h2>
          <p className="contact-subtitle">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        {error && (
          <div className="contact-error">
            <span className="contact-error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="contact-success">
            <span className="contact-success-icon">✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-form-group">
            <label className="contact-label">Your Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="contact-input"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="contact-form-group">
            <label className="contact-label">Phone Number *</label>
            <div className="contact-phone-field">
              <div className="contact-phone-prefix">
                <span className="contact-phone-prefix-text">+254</span>
                <input
                  type="tel"
                  className={`contact-phone-input ${phoneError ? 'contact-input-error' : ''}`}
                  placeholder="712345678"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                />
              </div>
              {phoneError && (
                <div className="contact-phone-error">
                  <span className="contact-error-icon">⚠️</span> {phoneError}
                </div>
              )}
              <div className="contact-phone-hint">
                <small>Enter 9 digits after +254 (e.g., 712345678)</small>
              </div>
            </div>
          </div>
          
          <div className="contact-form-group">
            <label className="contact-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="contact-input"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="contact-form-group">
            <label className="contact-label">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="contact-textarea"
              rows="6"
              placeholder="Write your message here..."
              required
            ></textarea>
          </div>
          
          <div className="contact-form-actions">
            <button 
              type="button"
              className="contact-back-btn"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
            <button type="submit" className="contact-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="contact-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </div>
        </form>
        
        <div className="contact-footer">
          <div className="contact-footer-buttons">
            <button 
              type="button"
              className="contact-call-btn"
              onClick={handleCall}
            >
              <span className="contact-call-icon">📞</span>
              Call Us
            </button>
            <button 
              type="button"
              className="contact-whatsapp-btn"
              onClick={handleWhatsApp}
            >
              <span className="contact-whatsapp-icon">💬</span>
              WhatsApp Us
            </button>
          </div>
          <div className="contact-response-time">
            <span className="contact-time-icon">⏰</span>
            <span>We typically respond within 24 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;