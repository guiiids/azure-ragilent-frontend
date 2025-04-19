#!/bin/bash

# Function to kill a process by port
kill_process_on_port() {
  PORT=$1
  PID=$(lsof -t -i:$PORT)
  if [ -n "$PID" ]; then
    echo "Killing process on port $PORT with PID $PID"
    kill -9 $PID
  else
    echo "No process found on port $PORT"
  fi
}

# Define the ports your servers are running on
FRONTEND_PORT=3000
BACKEND_PORT=5001

# Kill the processes
kill_process_on_port $FRONTEND_PORT
kill_process_on_port $BACKEND_PORT

# Additional cleanup if necessary
# e.g., remove temporary files, clear caches, etc.

echo "Servers stopped and cleaned up."