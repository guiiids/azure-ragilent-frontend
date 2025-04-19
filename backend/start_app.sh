#!/bin/bash

# Start the Flask backend and React frontend together
# Usage: ./start_app.sh [dev|prod]
# Default is development mode

# --- Kill existing processes on ports ---
echo "Attempting to kill existing processes on ports 3000 and 5001..."
lsof -ti :3000 | xargs kill -9 2>/dev/null
lsof -ti :5001 | xargs kill -9 2>/dev/null
sleep 1 # Give a moment for ports to free up
echo "Done."
# ---

# Determine environment
ENV=${1:-dev}
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  export FLASK_ENV=production
  FRONTEND_CMD="serve -s build"
  BACKEND_CMD="gunicorn --workers=4 --bind=0.0.0.0:5001 --log-level=info api:app"
  echo "Starting in PRODUCTION mode"
else
  export FLASK_ENV=development
  FRONTEND_CMD="npm start"
  BACKEND_CMD="python api.py"
  echo "Starting in DEVELOPMENT mode"
fi

# Note: Configuration values are loaded from config.py and .env
echo "Using configuration values from config.py and .env"

# Create log directory if it doesn't exist
mkdir -p logs

# Function to clean up processes on exit
cleanup() {
  echo "Stopping all processes..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT TERM

# Build frontend for production if needed
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  echo "Building frontend for production..."
  cd evalui && npm run build && cd ..
  
  # Check if build was successful
  if [ ! -d "evalui/build" ]; then
    echo "Error: Frontend build failed."
    exit 1
  fi
  
  # Install serve if not already installed
  if ! command -v serve &> /dev/null; then
    echo "Installing 'serve' package..."
    npm install -g serve
  fi
fi

# Start the backend
echo "Starting backend..."
# Unset potentially conflicting Flask environment variables
unset FLASK_RUN_PORT
unset FLASK_DEBUG

# Start backend with appropriate command
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  cd . && $BACKEND_CMD > logs/backend.log 2>&1 &
else
  cd . && $BACKEND_CMD > logs/backend.log 2>&1 &
fi
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Check if backend started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "Error: Backend failed to start. Check logs/backend.log for details."
  exit 1
fi

echo "Backend running with PID: $BACKEND_PID"

# Start the frontend
echo "Starting frontend..."
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  cd evalui && PORT=3000 $FRONTEND_CMD > ../logs/frontend.log 2>&1 &
else
  cd evalui && PORT=3000 $FRONTEND_CMD > ../logs/frontend.log 2>&1 &
fi
FRONTEND_PID=$!

# Wait a moment for the frontend to start
sleep 5

# Check if frontend started successfully
if ! ps -p $FRONTEND_PID > /dev/null; then
  echo "Error: Frontend failed to start. Check logs/frontend.log for details."
  kill $BACKEND_PID
  exit 1
fi

echo "Frontend running with PID: $FRONTEND_PID"

# Display appropriate URLs
if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  FRONTEND_PORT=3000  # Default port for 'serve'
  echo "Application is running in PRODUCTION mode!"
else
  FRONTEND_PORT=3000  # Default React development port
  echo "Application is running in DEVELOPMENT mode!"
fi

echo "- Frontend: http://localhost:$FRONTEND_PORT"
echo "- Backend API: http://localhost:5001"
echo "- Logs in logs/ directory"
echo ""
echo "Press Ctrl+C to stop all processes"

# Wait for user to press Ctrl+C
wait
