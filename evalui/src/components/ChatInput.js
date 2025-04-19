import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const { getThemeClass, getThemeStyle } = useTheme();
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className={getThemeClass('chatInputContainer')} style={getThemeStyle('chatInputContainer')}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question here..."
          disabled={isLoading}
          className={getThemeClass('chatInput')}
          style={getThemeStyle('chatInput')}
        />
        <button 
          type="submit" 
          disabled={isLoading || !message.trim()} 
          className={getThemeClass('sendButton')}
          style={getThemeStyle('sendButton')}
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
