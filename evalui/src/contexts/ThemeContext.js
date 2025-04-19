import React, { createContext, useState, useEffect, useContext } from 'react';
import { getTheme } from '../themes';

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get the initial theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'default';
  });

  // Get the theme object
  const theme = getTheme(currentTheme);

  // Function to change the theme
  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('theme', themeName);
  };

  // Load the appropriate CSS framework when the theme changes
  useEffect(() => {
    // Remove any previously loaded theme stylesheets
    const existingLink = document.getElementById('theme-stylesheet');
    if (existingLink) {
      existingLink.remove();
    }
    
    // Don't load external stylesheet for default theme
    if (currentTheme === 'default') return;
    
    // Create and append the new stylesheet link
    const link = document.createElement('link');
    link.id = 'theme-stylesheet';
    link.rel = 'stylesheet';
    
    if (currentTheme === 'tailwind') {
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    } else if (currentTheme === 'bootstrap') {
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    }
    
    document.head.appendChild(link);
    
    // Cleanup function
    return () => {
      if (document.getElementById('theme-stylesheet')) {
        document.getElementById('theme-stylesheet').remove();
      }
    };
  }, [currentTheme]);

  // Helper function to get the appropriate class for a component
  const getThemeClass = (componentName) => {
    return theme.classMap[componentName] || '';
  };

  // Helper function to get additional inline styles for a component
  const getThemeStyle = (componentName) => {
    return theme.additionalStyles[componentName] || {};
  };

  // Context value
  const contextValue = {
    currentTheme,
    changeTheme,
    getThemeClass,
    getThemeStyle,
    theme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
