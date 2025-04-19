const defaultTheme = {
  name: 'Default',
  // Map component classes to default classes
  classMap: {
    // Main containers
    chatInterface: 'chat-interface',
    chatHeader: 'chat-header',
    chatHeaderTitle: 'chat-header-title',
    chatHeaderSubtitle: 'chat-header-subtitle',
    chatContent: 'chat-content',
    chatFooter: 'chat-footer',
    
    // Chat input
    chatInputContainer: 'chat-input-container',
    chatInput: 'chat-input',
    sendButton: 'send-button',
    
    // Chat response
    chatResponse: 'chat-response',
    responseContent: 'response-content',
    responseText: 'response-text',
    sourcesSection: 'sources-section',
    sourcesList: 'sources-list',
    sourceItem: 'source-item',
    sourceTitle: 'source-title',
    sourceLink: 'source-link',
    citationLink: 'citationLink', // Add class for in-text citations
    
    // Loading and error states
    loadingIndicator: 'loading-indicator',
    spinner: 'spinner',
    errorMessage: 'error-message',
    noResponseMessage: 'no-response-message',
    
    // Debug panel
    debugPanel: 'debug-panel',
    debugHeader: 'debug-header',
    debugInfo: 'debug-info',
    debugActions: 'debug-actions',
    debugButton: 'debug-button',
    
    // Evaluation card
    evaluationCard: 'evaluation-card',
    evaluationHeader: 'evaluation-header',
    evaluationContent: 'evaluation-content',
    evaluationItem: 'evaluation-item',
    evaluationScore: 'evaluation-score',
    
    // Feedback buttons
    feedbackContainer: 'feedback-container',
    feedbackTitle: 'feedback-title',
    feedbackButtons: 'feedback-buttons',
    feedbackButton: 'feedback-button',
    feedbackButtonPositive: 'feedback-button-positive',
    feedbackButtonNegative: 'feedback-button-negative',
    feedbackComment: 'feedback-comment',
    feedbackSubmit: 'feedback-submit'
  },
  
  // No additional styles needed for default theme as they're already in the CSS files
  additionalStyles: {}
};

export default defaultTheme;
