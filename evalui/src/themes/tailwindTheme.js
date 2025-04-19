const tailwindTheme = {
  name: 'Tailwind',
  // Map component classes to Tailwind CSS classes
  classMap: {
    // Main containers
    chatInterface: 'flex flex-col h-screen max-w-6xl mx-auto bg-white shadow-lg',
    chatHeader: 'p-5 bg-blue-600 text-white text-center',
    chatHeaderTitle: 'text-2xl font-semibold m-0',
    chatHeaderSubtitle: 'text-base mt-1 opacity-90',
    chatContent: 'flex-1 p-5 overflow-y-auto bg-gray-50',
    chatFooter: 'border-t border-gray-200 bg-white',
  
    // Chat input
    chatInputContainer: 'w-full p-4 bg-gray-50 border-t border-gray-200',
    chatInputGroup: 'flex w-full',
    chatInput: 'w-full flex-1 py-3 px-4 border border-gray-300 rounded-l-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    sendButton: 'py-3 px-5 bg-blue-500 text-white rounded-r-full text-base hover:bg-blue-600 transition-colors',
    
    // Chat response
    chatResponse: 'bg-white rounded-lg shadow p-5 mb-4 transition-all',
    responseContent: 'mb-4',
    responseText: 'text-gray-800 text-base leading-relaxed whitespace-pre-wrap',
    sourcesSection: 'mt-5 pt-4 border-t border-gray-200',
    sourcesList: 'list-none p-0 m-0',
    sourceItem: 'bg-gray-100 rounded p-2 mb-2 text-sm',
    sourceTitle: 'font-medium text-gray-700',
    
    // Loading and error states
    loadingIndicator: 'flex flex-col items-center justify-center py-10',
    spinner: 'w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4',
    errorMessage: 'bg-red-100 text-red-800 p-4 rounded-lg mb-5 shadow-sm',
    noResponseMessage: 'bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center mb-5 shadow-sm',
    
    // Debug panel
    debugPanel: 'mb-5 border border-gray-300 rounded-lg overflow-hidden',
    debugHeader: 'bg-gray-200 p-2 cursor-pointer flex items-center',
    debugInfo: 'border-t border-gray-300 p-3 bg-gray-100 font-mono text-xs whitespace-pre-wrap overflow-x-auto',
    debugActions: 'mt-2 flex justify-end',
    debugButton: 'bg-gray-600 text-white border-none rounded px-2 py-1 text-xs cursor-pointer hover:bg-gray-700',
    
    // Evaluation card
    evaluationCard: 'bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100',
    evaluationHeader: 'text-blue-800 text-lg font-medium mb-2',
    evaluationContent: 'text-blue-900',
    evaluationItem: 'mb-2 flex justify-between',
    evaluationScore: 'font-semibold',
    
    // Feedback buttons
    feedbackContainer: 'mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200',
    feedbackTitle: 'text-gray-700 font-medium mb-3',
    feedbackButtons: 'flex gap-2 mb-4',
    feedbackButton: 'py-2 px-4 rounded-md text-sm font-medium transition-colors',
    feedbackButtonPositive: 'bg-green-100 text-green-700 hover:bg-green-200',
    feedbackButtonNegative: 'bg-red-100 text-red-700 hover:bg-red-200',
    feedbackComment: 'w-full p-2 border border-gray-300 rounded-md text-sm mb-3',
    feedbackSubmit: 'bg-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors'
  },
  
  // Additional inline styles that might be needed
  additionalStyles: {
    // Add any additional inline styles here if needed
  }
};

export default tailwindTheme;
