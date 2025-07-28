#!/bin/bash

# Spend Tracker Setup Script
echo "🚀 Setting up Spend Tracker Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install v14 or higher."
    exit 1
fi
print_success "Node.js $(node -v) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
print_success "Python $PYTHON_VERSION found"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client not found. Please make sure MySQL server is running."
fi

# Setup Backend
print_status "Setting up backend..."

cd backend

# Create virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv
if [ $? -eq 0 ]; then
    print_success "Virtual environment created"
else
    print_error "Failed to create virtual environment"
    exit 1
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    print_success "Python dependencies installed"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

cd ..

# Setup Frontend
print_status "Setting up frontend..."

cd frontend

# Install Node dependencies
print_status "Installing Node.js dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

cd ..

# Database setup instructions
print_status "Database setup required..."
print_warning "Please complete the following steps manually:"
echo "1. Start your MySQL server"
echo "2. Create the database:"
echo "   mysql -u root -p -e 'CREATE DATABASE spend_tracker;'"
echo "3. Import the schema:"
echo "   mysql -u root -p spend_tracker < database/schema.sql"
echo "4. Copy backend/.env.example to backend/.env and update with your database credentials"

print_success "Setup completed!"
print_status "To start the application:"
echo "1. Start the backend:"
echo "   cd backend && source venv/bin/activate && python app.py"
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
print_success "Your Spend Tracker will be available at http://localhost:3000"