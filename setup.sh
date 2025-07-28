#!/bin/bash

# Spend Tracker Setup Script
# This script automates the setup process for the Spend Tracker application

echo "🚀 Setting up Spend Tracker Application..."
echo "==========================================="

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if commands exist
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install $1 and try again."
        exit 1
    fi
}

# Check prerequisites
print_status "Checking prerequisites..."

check_command "node"
check_command "npm"
check_command "python3"
check_command "mysql"

print_success "All prerequisites are installed!"

# Get database credentials
echo ""
print_status "Database Configuration"
echo "Please provide your MySQL database credentials:"

read -p "MySQL Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL Username (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "MySQL Password: " DB_PASSWORD
echo ""

read -p "Database Name (default: spend_tracker): " DB_NAME
DB_NAME=${DB_NAME:-spend_tracker}

# Test MySQL connection
print_status "Testing MySQL connection..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null

if [ $? -ne 0 ]; then
    print_error "Failed to connect to MySQL. Please check your credentials."
    exit 1
fi

print_success "MySQL connection successful!"

# Create database
print_status "Creating database..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Database '$DB_NAME' created successfully!"
else
    print_warning "Database '$DB_NAME' might already exist."
fi

# Import schema
print_status "Importing database schema..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/schema.sql

if [ $? -eq 0 ]; then
    print_success "Database schema imported successfully!"
else
    print_error "Failed to import database schema."
    exit 1
fi

# Ask if user wants sample data
echo ""
read -p "Do you want to import sample data for testing? (y/N): " IMPORT_SAMPLE
if [[ $IMPORT_SAMPLE =~ ^[Yy]$ ]]; then
    print_status "Importing sample data..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/sample_data.sql
    if [ $? -eq 0 ]; then
        print_success "Sample data imported successfully!"
        print_status "Demo login: username='demo_user', password='demo123'"
    else
        print_warning "Failed to import sample data, but setup can continue."
    fi
fi

# Setup Backend
echo ""
print_status "Setting up Flask backend..."

cd backend

# Update database configuration in app.py
print_status "Updating database configuration..."
sed -i.bak "s/'host': 'localhost'/'host': '$DB_HOST'/g" app.py
sed -i.bak "s/'user': 'root'/'user': '$DB_USER'/g" app.py
sed -i.bak "s/'password': 'password'/'password': '$DB_PASSWORD'/g" app.py
sed -i.bak "s/'database': 'spend_tracker'/'database': '$DB_NAME'/g" app.py

# Create virtual environment
print_status "Creating Python virtual environment..."
python3 -m venv venv

if [ $? -eq 0 ]; then
    print_success "Virtual environment created!"
else
    print_error "Failed to create virtual environment."
    exit 1
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Python dependencies installed!"
else
    print_error "Failed to install Python dependencies."
    exit 1
fi

cd ..

# Setup Frontend
echo ""
print_status "Setting up React frontend..."

cd frontend

print_status "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed!"
else
    print_error "Failed to install Node.js dependencies."
    exit 1
fi

cd ..

# Create startup scripts
print_status "Creating startup scripts..."

# Backend startup script
cat > start_backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
echo "Starting Flask backend on http://localhost:5000"
python app.py
EOF

# Frontend startup script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
cd frontend
echo "Starting React frontend on http://localhost:3000"
npm start
EOF

# Make startup scripts executable
chmod +x start_backend.sh
chmod +x start_frontend.sh

# Create development startup script
cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Spend Tracker in Development Mode"
echo "============================================="

# Function to kill all background processes on exit
cleanup() {
    echo "Shutting down..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Start backend
echo "Starting Flask backend..."
./start_backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting React frontend..."
./start_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
EOF

chmod +x start_dev.sh

# Setup complete
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_success "Spend Tracker has been successfully set up!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the backend:  ./start_backend.sh"
echo "2. Start the frontend: ./start_frontend.sh"
echo "3. Or start both:      ./start_dev.sh"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
if [[ $IMPORT_SAMPLE =~ ^[Yy]$ ]]; then
    echo "🎯 Demo Login:"
    echo "   Username: demo_user"
    echo "   Password: demo123"
    echo ""
fi
echo "📚 Documentation: See README.md for detailed information"
echo ""
print_success "Happy tracking! 💰"