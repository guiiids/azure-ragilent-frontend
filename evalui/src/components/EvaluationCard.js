import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './EvaluationCard.css';

const EvaluationCard = ({ evaluation }) => {
  const { getThemeClass, getThemeStyle } = useTheme();
  if (!evaluation) return null;

  // Handle case where evaluation is just raw text
  if (evaluation.raw_text) {
    return (
      <div className={getThemeClass('evaluationCard')} style={getThemeStyle('evaluationCard')}>
        <h3 className={getThemeClass('evaluationHeader')} style={getThemeStyle('evaluationHeader')}>Evaluation</h3>
        <div className={getThemeClass('evaluationContent')} style={getThemeStyle('evaluationContent')}>
          {evaluation.raw_text}
        </div>
      </div>
    );
  }

  // Extract key metrics for display
  const {
    // user_question, // Removed as it's unused
    bot_understood_question,
    response_type,
    response_effectiveness,
    factually_correct,
    engagement_proactiveness,
    confidence_in_evaluation,
    context_utilization,
    context_matches,
    issues_identified,
    suggested_improvements
  } = evaluation;

  return (
    <div className={getThemeClass('evaluationCard')} style={getThemeStyle('evaluationCard')}>
      <h3 className={getThemeClass('evaluationHeader')} style={getThemeStyle('evaluationHeader')}>Response Evaluation</h3>
      
      <div className="evaluation-metrics">
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Question Understood:</span>
            <span className={`metric-value ${bot_understood_question === 'Yes' ? 'positive' : 'negative'}`}>
              {bot_understood_question || 'N/A'}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Response Type:</span>
            <span className="metric-value">{response_type || 'N/A'}</span>
          </div>
        </div>
        
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Effectiveness:</span>
            <span className={`metric-value ${getEffectivenessClass(response_effectiveness)}`}>
              {response_effectiveness || 'N/A'}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Factually Correct:</span>
            <span className={`metric-value ${factually_correct === 'Yes' ? 'positive' : 'negative'}`}>
              {factually_correct || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Engagement:</span>
            <span className={`metric-value ${getEngagementClass(engagement_proactiveness)}`}>
              {engagement_proactiveness || 'N/A'}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Confidence:</span>
            <span className="metric-value">{confidence_in_evaluation || 'N/A'}</span>
          </div>
        </div>
        
        <div className="metric-row">
          <div className="metric">
            <span className="metric-label">Context Usage:</span>
            <span className={`metric-value ${getContextUtilizationClass(context_utilization)}`}>
              {context_utilization || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {context_matches && context_matches.length > 0 && (
        <div className="context-matches-section">
          <h4>Fact Checking</h4>
          <div className="context-matches-list">
            {context_matches.map((match, index) => (
              <div key={index} className="context-match-item">
                <div className="claim">
                  <strong>Claim:</strong> {match.claim}
                </div>
                <div className={`match ${match.match.includes('❌') ? 'not-found' : 'found'}`}>
                  <strong>Match:</strong> {match.match}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {issues_identified && issues_identified.length > 0 && (
        <div className="issues-section">
          <h4>Issues Identified</h4>
          <ul className="issues-list">
            {issues_identified.map((issue, index) => (
              <li key={index} className="issue-item">{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {suggested_improvements && suggested_improvements.length > 0 && (
        <div className="improvements-section">
          <h4>Suggested Improvements</h4>
          <ul className="improvements-list">
            {suggested_improvements.map((improvement, index) => (
              <li key={index} className="improvement-item">{improvement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper functions for styling based on values
const getEffectivenessClass = (effectiveness) => {
  if (!effectiveness) return '';
  if (effectiveness === 'Fully') return 'positive';
  if (effectiveness === 'Mostly') return 'mostly-positive';
  if (effectiveness === 'Partially') return 'neutral';
  return 'negative';
};

const getEngagementClass = (engagement) => {
  if (!engagement) return '';
  if (engagement === 'Excellent') return 'positive';
  if (engagement === 'Good') return 'mostly-positive';
  if (engagement === 'Minimal') return 'neutral';
  return 'negative';
};

const getContextUtilizationClass = (utilization) => {
  if (!utilization) return '';
  if (utilization === 'Fully') return 'positive';
  if (utilization === 'Partially') return 'neutral';
  return 'negative';
};

export default EvaluationCard;
