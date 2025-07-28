#!/bin/bash

# Spend Tracker Start Script
echo "🚀 Starting Spend Tracker Application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    print_status "Shutting down Spend Tracker..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Node modules not found. Please run ./setup.sh first."
    exit 1
fi

# Start backend
print_status "Starting Flask backend..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

print_success "Backend started on http://localhost:5000"

# Wait a moment for backend to start
sleep 2

# Start frontend
print_status "Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

print_success "Frontend will start on http://localhost:3000"

print_status "Both services are starting up..."
print_status "Backend PID: $BACKEND_PID"
print_status "Frontend PID: $FRONTEND_PID"
print_status "Press Ctrl+C to stop both services"

# Wait for both processes
wait