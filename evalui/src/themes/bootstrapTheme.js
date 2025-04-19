const bootstrapTheme = {
  name: 'Bootstrap',
  // Map component classes to Bootstrap 5 classes
  classMap: {
    // Main containers
    chatInterface: 'd-flex flex-column vh-100 container-lg mx-auto bg-white shadow',
    chatHeader: 'p-4 bg-primary text-white text-center',
    chatHeaderTitle: 'h4 mb-0',
    chatHeaderSubtitle: 'small mt-1 opacity-75',
    chatContent: 'flex-grow-1 p-3 overflow-auto bg-light',
    chatFooter: 'border-top bg-white',
    
    // Chat input
    chatInputContainer: 'w-100 p-3 bg-light border-top',
    chatInput: 'form-control rounded-pill-start',
    sendButton: 'btn btn-primary rounded-pill-end',
    
    // Chat response
    chatResponse: 'card mb-3 border-0 shadow-sm',
    responseContent: 'card-body',
    responseText: 'card-text text-body',
    sourcesSection: 'mt-3 pt-3 border-top',
    sourcesList: 'list-unstyled',
    sourceItem: 'bg-light rounded p-2 mb-2 small',
    sourceTitle: 'fw-medium text-body',
    
    // Loading and error states
    loadingIndicator: 'd-flex flex-column align-items-center justify-content-center py-5',
    spinner: 'spinner-border text-primary mb-3',
    errorMessage: 'alert alert-danger mb-3',
    noResponseMessage: 'alert alert-warning text-center mb-3',
    
    // Debug panel
    debugPanel: 'mb-3 border rounded overflow-hidden',
    debugHeader: 'bg-secondary bg-opacity-10 p-2 cursor-pointer d-flex align-items-center',
    debugInfo: 'border-top p-3 bg-light font-monospace small overflow-auto',
    debugActions: 'mt-2 d-flex justify-content-end',
    debugButton: 'btn btn-sm btn-secondary',
    
    // Evaluation card
    evaluationCard: 'card mb-3 bg-info bg-opacity-10 border-info border-opacity-25',
    evaluationHeader: 'card-header bg-transparent border-0 text-info fw-medium',
    evaluationContent: 'card-body pt-0 text-body',
    evaluationItem: 'mb-2 d-flex justify-content-between',
    evaluationScore: 'fw-bold',
    
    // Feedback buttons
    feedbackContainer: 'mt-4 p-3 bg-light rounded border',
    feedbackTitle: 'text-body fw-medium mb-3',
    feedbackButtons: 'd-flex gap-2 mb-3',
    feedbackButton: 'btn btn-sm',
    feedbackButtonPositive: 'btn-outline-success',
    feedbackButtonNegative: 'btn-outline-danger',
    feedbackComment: 'form-control form-control-sm mb-3',
    feedbackSubmit: 'btn btn-sm btn-primary'
  },
  
  // Additional inline styles that might be needed for Bootstrap
  additionalStyles: {
    // Custom styles for rounded-pill-start and rounded-pill-end
    chatInput: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0
    },
    sendButton: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0
    }
  }
};

export default bootstrapTheme;
