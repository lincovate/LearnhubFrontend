import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useChatTheme = () => useContext(ThemeContext);

export const ChatThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('chatTheme');
    return stored || 'light';
  });

  const themes = {
    light: { background: '#fff', text: '#333', bubbleOwn: '#d9f0ff', bubbleOther: '#f1f3f5', headerBg: '#fafafa', border: '#e0e0e0', inputBg: '#fff' },
    dark: { background: '#161624', text: '#eee', bubbleOwn: '#2d2d44', bubbleOther: '#3a3a5a', headerBg: '#16213e', border: '#2d2d44', inputBg: '#2d2d44' },
    gray: { background: '#e4dfdf', text: '#333', bubbleOwn: '#d0d0d0', bubbleOther: '#e0e0e0', headerBg: '#e8e8e8', border: '#ccc', inputBg: '#fff' },
    purple: { background: '#dfc9f7', text: '#2d1b4e', bubbleOwn: '#d8b4fe', bubbleOther: '#e9d5ff', headerBg: '#e9d5ff', border: '#d8b4fe', inputBg: '#fff' },
    yellow: { background: '#f0dd9b', text: '#4d3b1a', bubbleOwn: '#fdebd0', bubbleOther: '#fcd089', headerBg: '#f4dbc5', border: '#f5b041', inputBg: '#fff' },
  };

  const currentTheme = themes[theme] || themes.light;

  useEffect(() => {
    localStorage.setItem('chatTheme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themes, currentTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};