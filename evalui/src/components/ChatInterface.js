import React, { useState } from 'react';
import axios from 'axios';
import ChatInput from './ChatInput';
import ChatResponse from './ChatResponse';
import EvaluationCard from './EvaluationCard';
import FeedbackButtons from './FeedbackButtons';
import { useTheme } from '../contexts/ThemeContext';
import './ChatInterface.css';

const ChatInterface = () => {
  const { getThemeClass, getThemeStyle } = useTheme();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [sources, setSources] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development'); // Only show debug in development

  const handleSendMessage = async (message) => {
    setQuery(message);
    setIsLoading(true);
    setError(null);
    
    console.log('Sending query to backend:', message);
    
    try {
      // Make API call to the backend
      console.log('Making API request to /api/chat');
      const result = await axios.post('/api/chat', { query: message });
      
      // Log the full response for debugging
      console.log('Received API response:', result);
      
      // Process the response
      const { answer, sources, evaluation } = result.data;
      
      console.log('Extracted answer:', answer);
      console.log('Extracted sources:', sources);
      console.log('Extracted evaluation:', evaluation);
      
      setResponse(answer);
      setSources(sources || []);
      setEvaluation(evaluation || null);
    } catch (err) {
      console.error('Error fetching response:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      setError(`Failed to get response: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (vote, comment) => {
    try {
      await axios.post('/api/feedback', {
        user_query: query,
        bot_response: response,
        evaluation_json: JSON.stringify(evaluation),
        vote,
        comment
      });
      console.log('Feedback submitted successfully');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <div className={getThemeClass('chatInterface')} style={getThemeStyle('chatInterface')}>
      <div className={getThemeClass('chatHeader')} style={getThemeStyle('chatHeader')}>
        <h1 className={getThemeClass('chatHeaderTitle')}>Agilent Support Assistant</h1>
        <p className={getThemeClass('chatHeaderSubtitle')}>Ask questions about Agilent products and services - 100% Free</p>
      </div>
      
      <div className={getThemeClass('chatContent')} style={getThemeStyle('chatContent')}>
        {/* Debug info panel - only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className={getThemeClass('debugPanel')} style={getThemeStyle('debugPanel')}>
            <div className={getThemeClass('debugHeader')} style={getThemeStyle('debugHeader')} onClick={() => setShowDebug(!showDebug)}>
              <h4>Debug Info {showDebug ? '▼' : '▶'}</h4>
            </div>
            
            {showDebug && (
              <div className={getThemeClass('debugInfo')} style={getThemeStyle('debugInfo')}>
                <p><strong>Query:</strong> {query}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {error ? 'Yes' : 'No'}</p>
                <p><strong>Response:</strong> {response ? 'Yes' : 'No'}</p>
                <p><strong>Sources:</strong> {sources ? sources.length : 0}</p>
                <p><strong>Evaluation:</strong> {evaluation ? 'Present' : 'None'}</p>
                
                <div className={getThemeClass('debugActions')} style={getThemeStyle('debugActions')}>
                  <button 
                    onClick={() => console.log({query, response, sources, evaluation, error})}
                    className={getThemeClass('debugButton')}
                    style={getThemeStyle('debugButton')}
                  >
                    Log State to Console
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {isLoading && (
          <div className={getThemeClass('loadingIndicator')} style={getThemeStyle('loadingIndicator')}>
            <div className={getThemeClass('spinner')} style={getThemeStyle('spinner')}></div>
            <p>Processing your question...</p>
          </div>
        )}
        
        {error && (
          <div className={getThemeClass('errorMessage')} style={getThemeStyle('errorMessage')}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && !error && response && (
          <div className="response-container">
            <ChatResponse response={response} sources={sources} />
            
            <EvaluationCard evaluation={evaluation} />
            
            <FeedbackButtons onFeedbackSubmit={handleFeedbackSubmit} />
          </div>
        )}
        
        {!isLoading && !error && !response && query && (
          <div className={getThemeClass('noResponseMessage')} style={getThemeStyle('noResponseMessage')}>
            <p>No response received. Please try again or contact support.</p>
          </div>
        )}
      </div>
      
      <div className={getThemeClass('chatFooter')} style={getThemeStyle('chatFooter')}>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;
