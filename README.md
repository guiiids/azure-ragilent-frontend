# Agilent Support Assistant UI

This project provides a React-based frontend UI for the Agilent Support Assistant, which uses Azure OpenAI Service with custom data via Azure Search.

## Repositories

- Backend: [https://github.com/guiiids/azure-ragilent](https://github.com/guiiids/azure-ragilent)
- Frontend: [https://github.com/guiiids/azure-ragilent-frontend](https://github.com/guiiids/azure-ragilent-frontend)

## Features

- Chat interface for user queries
- Display of AI-generated responses
- Display of evaluation metrics for response quality
- User feedback collection (thumbs up/down with optional comments)
- Source citation display

## Project Structure

- `evalui/` - React frontend application
- `api.py` - Flask API server that connects the frontend to the backend
- `assistant_core.py` - Core assistant functionality
- `rag_assistant.py` - RAG (Retrieval-Augmented Generation) implementation
- `vote_manager.py` - User feedback collection and storage
- `config.py` - Configuration settings

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm 6+

### Backend Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configuration:
   The application uses configuration values from `config.py`. You can review and modify these settings if needed.
   
   Note: The default configuration includes:
   - Azure OpenAI endpoint: https://support01.openai.azure.com/
   - Azure OpenAI deployment: deployment02
   - Azure OpenAI API key: Included in config.py

3. Start the Flask API server:
   ```
   python api.py
   ```

### Quick Setup (Frontend and Backend)

1. Install all dependencies (both Node.js and Python):
   ```
   npm run install-all
   pip install -r requirements.txt
   ```

2. Start both frontend and backend with a single command:
   ```
   ./start_app.sh
   ```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

### Manual Setup (Separate Frontend and Backend)

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the Flask API server:
   ```
   python api.py
   ```

3. In a separate terminal, navigate to the React app directory:
   ```
   cd evalui
   ```

4. Install frontend dependencies:
   ```
   npm install
   ```

5. Start the React development server:
   ```
   npm start
   ```

6. The application will be available at http://localhost:3000

## Usage

1. Enter your question in the input field at the bottom of the interface
2. The system will process your query and display the response
3. Review the response and its evaluation metrics
4. Provide feedback using the thumbs up/down buttons
5. Optionally add a comment with your feedback

## Development

- The frontend is built with React
- The backend uses Flask to serve API endpoints
- Communication between frontend and backend is via HTTP requests
- User feedback is stored in a SQLite database (`votes.db`)

## Debugging and Troubleshooting

### Debug Information

The application includes debugging features to help identify issues:

1. **Frontend Debug Panel**: The UI includes a debug panel showing the current state of queries, responses, and errors.

2. **Console Logging**: The React app logs detailed information about API requests and responses to the browser console.

3. **Backend Logging**: 
   - The Flask API logs to `api_debug.log`
   - The assistant core logs to `assistant_core3.log`
   - Both include detailed information about each step of processing

### Testing the Backend Separately

You can test the backend API independently using the included test script:

```
python test_backend.py
```

This script tests both the chat and feedback endpoints and provides detailed logging of the responses.

### Common Issues

1. **Empty Responses**: If you see the loading spinner but then get an empty screen:
   - Check the browser console for error messages
   - Verify the backend API is running on port 5001
   - Check the API logs for errors during processing

2. **Azure OpenAI Connection Issues**:
   - Ensure environment variables are set correctly
   - Check `assistant_core3.log` for API connection errors
   - Verify the Azure OpenAI deployment is active and accessible

3. **CORS Issues**:
   - The API includes CORS headers, but you may need to adjust them if hosting on different domains
   - Check browser console for CORS-related errors
