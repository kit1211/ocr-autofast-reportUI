#!/bin/bash

# Dashboard Startup Script
# This script will start both Backend API and Frontend servers

echo "🚀 Starting Dashboard Analytics..."
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null
then
    echo "❌ Error: Bun is not installed"
    echo "Please install Bun from https://bun.sh"
    exit 1
fi

echo "✅ Bun is installed"
echo ""

# Start Backend API Server in background
echo "📡 Starting Backend API Server on port 3001..."
bun run server &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""

# Wait a moment for backend to start
sleep 2

# Start Frontend Dev Server
echo "🎨 Starting Frontend Dashboard..."
echo "Press Ctrl+C to stop both servers"
echo ""
bun run dev

# When frontend is stopped, also stop backend
echo ""
echo "🛑 Stopping Backend API Server..."
kill $BACKEND_PID

echo "✅ Dashboard stopped"

