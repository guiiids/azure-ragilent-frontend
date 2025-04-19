import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import VotesAnalytics from './components/VotesAnalytics';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  const [currentView, setCurrentView] = useState('chat');

  return (
    <ThemeProvider>
      <div className="App">
        <div className="app-header">
          <ThemeSwitcher />
          <div className="navigation">
            <button 
              className={`nav-button ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
            >
              Chat
            </button>
            <button 
              className={`nav-button ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
        
        {currentView === 'chat' ? (
          <ChatInterface />
        ) : (
          <VotesAnalytics />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
