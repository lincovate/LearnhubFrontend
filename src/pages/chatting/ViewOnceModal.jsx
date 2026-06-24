import React from 'react';
import './ViewOnceModal.css';

const ViewOnceModal = ({ content, onClose, theme }) => {
  return (
    <div className="viewonce-overlay" onClick={onClose}>
      <div className="viewonce-container" style={{ background: theme.background, color: theme.text, borderColor: theme.border }}>
        <div className="viewonce-header">
          <h4>View Once Message</h4>
          <button className="viewonce-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="viewonce-content">
          <p>{content}</p>
        </div>
        <div className="viewonce-footer">
          <button onClick={onClose} className="viewonce-done-btn">I've seen it</button>
        </div>
      </div>
    </div>
  );
};

export default ViewOnceModal;