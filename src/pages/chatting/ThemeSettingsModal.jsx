import React from 'react';
import { useChatTheme } from '../../contexts/ThemeContext';
import './ThemeSettingsModal.css';

const ThemeSettingsModal = ({ onClose }) => {
  const { theme, toggleTheme } = useChatTheme();
  const themes = ['light', 'dark', 'gray', 'purple', 'yellow'];

  return (
    <div className="themesettings-overlay" onClick={onClose}>
      <div className="themesettings-container" onClick={(e) => e.stopPropagation()}>
        <div className="themesettings-header">
          <h3>Choose Theme</h3>
          <button className="themesettings-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="themesettings-grid">
          {themes.map((t) => (
            <div
              key={t}
              className={`themesettings-item ${theme === t ? 'active' : ''}`}
              onClick={() => toggleTheme(t)}
            >
              <div className={`themesettings-preview themesettings-${t}`}>
                <div className="themesettings-preview-bubble own">Hello</div>
                <div className="themesettings-preview-bubble other">Hi there</div>
              </div>
              <span className="themesettings-name">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              {theme === t && <span className="themesettings-check">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsModal;