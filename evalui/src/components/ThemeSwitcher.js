import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themeNames } from '../themes';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { currentTheme, changeTheme } = useTheme();

  // Theme display names
  const themeDisplayNames = {
    default: 'Default',
    tailwind: 'Tailwind CSS',
    bootstrap: 'Bootstrap 5'
  };

  return (
    <div className="theme-switcher">
      <div className="theme-switcher-toggle">
        <button 
          className="theme-button"
          onClick={() => document.querySelector('.theme-options').classList.toggle('show')}
        >
          <span className="theme-icon">🎨</span>
          <span className="theme-label">Theme: {themeDisplayNames[currentTheme]}</span>
        </button>
      </div>
      
      <div className="theme-options">
        {themeNames.map(themeName => (
          <div 
            key={themeName}
            className={`theme-option ${currentTheme === themeName ? 'active' : ''}`}
            onClick={() => {
              changeTheme(themeName);
              document.querySelector('.theme-options').classList.remove('show');
            }}
          >
            <div className={`theme-preview ${themeName}-preview`}></div>
            <span className="theme-name">{themeDisplayNames[themeName]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
