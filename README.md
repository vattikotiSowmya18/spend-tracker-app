# 💰 Spend Tracker - Personal Finance Manager

A comprehensive full-stack personal finance web application built with React, Flask, and MySQL. Track your income, expenses, and financial goals with beautiful charts and detailed analytics.

## 🚀 Features

### ✅ Core Features
- **Transaction Management**: Add, edit, delete transactions with running balance calculation
- **Smart Filtering**: Filter by categories, date ranges, weekly/monthly views
- **Financial Summary**: Real-time calculation of income, expenses, and net balance
- **Category Management**: Create custom categories with colors and icons
- **Data Export**: Export filtered transactions to CSV format
- **Analytics Dashboard**: Pie charts, bar charts, and trend analysis
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔧 Advanced Features (Built-in Support)
- **User Authentication**: JWT-based authentication system
- **Multi-user Support**: Separate data for each user
- **Recurring Transactions**: Automated recurring income/expenses
- **Budget Goals**: Set and track spending/saving goals
- **Tags & Notes**: Add metadata to transactions
- **Audit Trail**: Track all changes with timestamps
- **Multi-currency**: Exchange rates and currency conversion
- **Soft Delete**: Recoverable deletion system

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Chart.js** - Beautiful interactive charts
- **Axios** - HTTP client for API calls
- **Date-fns** - Date manipulation library
- **Plain CSS** - Custom responsive styling

### Backend
- **Flask** - Python web framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **MySQL 8.0+** - Primary database
- **Comprehensive Schema** - 12 tables with relationships
- **Indexing** - Optimized for performance

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd spend-tracker
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE spend_tracker;
exit

# Import the schema
mysql -u root -p spend_tracker < database/schema.sql
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Update database configuration in app.py if needed
# DB_CONFIG = {
#     'host': 'localhost',
#     'database': 'spend_tracker',
#     'user': 'root',
#     'password': 'your_password'
# }

# Run the Flask server
python app.py
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🎯 Usage

### Getting Started
1. **Demo Login**: Use the "Try Demo Login" button for quick access
2. **Create Account**: Register with username, email, and password
3. **Add Categories**: Create custom categories for your transactions
4. **Add Transactions**: Start tracking your income and expenses

### Key Features Guide

#### 📊 Transaction Management
- Click "Add Transaction" to create new entries
- Fill in date, category, description, and amount (credited or debited)
- Edit transactions by clicking the edit icon
- Delete transactions with soft-delete (recoverable)

#### 🔍 Filtering & Views
- **Categories**: Filter by specific categories or view all
- **Time Periods**: 
  - All Time: Custom date range
  - Weekly: Navigate week by week
  - Monthly: Navigate month by month
- **Date Range**: Set custom from/to dates

#### 📈 Analytics & Charts
- **Pie Chart**: Spending distribution by category
- **Bar Chart**: Top categories comparison
- **Trends**: Monthly income vs expenses over time
- **Quick Stats**: Summary metrics and insights

#### 📤 Data Export
- Export filtered transactions to CSV
- Compatible with Excel and Google Sheets
- Includes all transaction details and notes

### 🔐 Authentication
- **Demo Mode**: Quick access without registration
- **User Registration**: Create secure accounts
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption

## 🗂️ Project Structure

```
spend-tracker/
├── backend/
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionList.js
│   │   │   ├── TransactionSummary.js
│   │   │   ├── ChartsPanel.js
│   │   │   ├── CategoryModal.js
│   │   │   ├── ExportModal.js
│   │   │   └── Login.js
│   │   ├── services/
│   │   │   └── api.js       # API service layer
│   │   ├── App.js          # Main App component
│   │   ├── App.css         # Global styles
│   │   └── index.js        # React entry point
│   └── package.json        # Frontend dependencies
├── database/
│   └── schema.sql          # Database schema
└── README.md               # This file
```

## 🎨 UI/UX Features

### Modern Design
- **Material Design**: Clean, intuitive interface
- **Color Coding**: Categories with custom colors
- **Responsive Layout**: Mobile-first design
- **Dark/Light Elements**: Balanced contrast
- **Smooth Animations**: Subtle transitions

### User Experience
- **Real-time Updates**: Instant balance calculations
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Visual feedback during operations
- **Success/Error Messages**: Clear user feedback
- **Keyboard Navigation**: Accessible interactions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/demo-login` - Demo access

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `POST /api/transactions` - Add new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add new category
- `DELETE /api/categories/:id` - Delete category

### Analytics
- `GET /api/analytics/category-spending` - Category spending data
- `GET /api/analytics/monthly-trends` - Monthly trends data

### Export
- `GET /api/export/csv` - Export transactions as CSV

## 🚀 Production Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a production WSGI server (Gunicorn)
3. Configure production database settings
4. Set up SSL certificates
5. Use environment variables for secrets

### Frontend Deployment
1. Build the production version: `npm run build`
2. Serve static files with nginx or Apache
3. Configure API endpoints for production
4. Set up CDN for static assets

### Database
1. Use managed MySQL service (AWS RDS, Google Cloud SQL)
2. Set up regular backups
3. Configure connection pooling
4. Monitor performance and optimize queries

## 🧪 Development

### Adding New Features
1. Create database migrations if needed
2. Add backend API endpoints
3. Create React components
4. Add styling and responsive design
5. Test across different devices

### Code Structure
- **Components**: Modular React components
- **Services**: API abstraction layer
- **Styles**: Component-specific CSS files
- **Database**: Normalized schema with relationships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Verify database connection and schema

## 🔮 Future Enhancements

- **Mobile App**: React Native companion app
- **Bank Integration**: Connect to bank APIs
- **Receipt Scanning**: OCR for receipt processing
- **Investment Tracking**: Portfolio management
- **Bill Reminders**: Automated notifications
- **Financial Reports**: PDF generation
- **Team Sharing**: Family/business accounts

---

**Built with ❤️ using React, Flask, and MySQL** 
