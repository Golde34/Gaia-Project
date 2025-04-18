#!/bin/bash

cd ../ai_core

# Variables
APP_MODULE="index:app"                   # Path to your FastAPI app
HOST="0.0.0.0"                           # Bind to all interfaces
PORT=4002                                # Port to run the application
RELOAD=false                             # Enable reload for development (optional)
NGROK_PORT=8000                          # Port to expose via ngrok

echo "Starting the application..."

# Function to kill the background processes when the script exits
cleanup() {
    echo "Stopping the application..."
    kill "$pid_uvicorn"  # Kill the Uvicorn process
}

# Trap to call cleanup on SIGINT (Ctrl + C) and SIGTERM (container stop)
trap cleanup SIGINT SIGTERM

# Run Uvicorn in the background
if [ "$RELOAD" = true ]; then
    uvicorn "$APP_MODULE" --host "$HOST" --port "$PORT" --reload &
else
    uvicorn "$APP_MODULE" --host "$HOST" --port "$PORT" &
fi

# Save the background process ID for Uvicorn
pid_uvicorn=$!

# Wait for the Uvicorn process to exit
wait "$pid_uvicorn"

