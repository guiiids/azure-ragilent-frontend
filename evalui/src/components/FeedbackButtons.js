import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './FeedbackButtons.css';

const FeedbackButtons = ({ onFeedbackSubmit }) => {
  const { getThemeClass, getThemeStyle } = useTheme();
  const [feedback, setFeedback] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackClick = (value) => {
    setFeedback(value);
    setShowCommentBox(true);
  };

  const handleSubmit = () => {
    if (feedback) {
      onFeedbackSubmit(feedback, comment);
      setSubmitted(true);
      setShowCommentBox(false);
    }
  };

  const handleCancel = () => {
    setFeedback(null);
    setComment('');
    setShowCommentBox(false);
  };

  if (submitted) {
    return (
      <div className={getThemeClass('feedbackContainer')} style={getThemeStyle('feedbackContainer')}>
        <div className="feedback-submitted">
          <span className="feedback-thanks">Thank you for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={getThemeClass('feedbackContainer')} style={getThemeStyle('feedbackContainer')}>
      <div className="feedback-prompt">
        <span className={getThemeClass('feedbackTitle')} style={getThemeStyle('feedbackTitle')}>Was this response helpful?</span>
        <div className={getThemeClass('feedbackButtons')} style={getThemeStyle('feedbackButtons')}>
          <button 
            className={`${getThemeClass('feedbackButton')} ${getThemeClass('feedbackButtonPositive')} ${feedback === 'yes' ? 'selected' : ''}`}
            style={getThemeStyle('feedbackButton')}
            onClick={() => handleFeedbackClick('yes')}
            aria-label="Thumbs up"
          >
            👍
          </button>
          <button 
            className={`${getThemeClass('feedbackButton')} ${getThemeClass('feedbackButtonNegative')} ${feedback === 'no' ? 'selected' : ''}`}
            style={getThemeStyle('feedbackButton')}
            onClick={() => handleFeedbackClick('no')}
            aria-label="Thumbs down"
          >
            👎
          </button>
        </div>
      </div>

      {showCommentBox && (
        <div className="feedback-comment-section">
          <textarea
            className={getThemeClass('feedbackComment')}
            style={getThemeStyle('feedbackComment')}
            placeholder="Additional comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <div className="feedback-actions">
            <button className="feedback-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className={getThemeClass('feedbackSubmit')}
              style={getThemeStyle('feedbackSubmit')}
              onClick={handleSubmit}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackButtons;
