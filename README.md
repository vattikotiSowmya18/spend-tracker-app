# 💰 Spend Tracker - Full-Stack Personal Finance App

A modern, feature-rich personal finance management application built with React, Flask, and MySQL. Track your income, expenses, and visualize your spending patterns with beautiful charts and analytics.

## 🚀 Features

### Core Features
- ✅ **Add/Edit/Delete Transactions** - Complete CRUD operations with real-time balance calculation
- 📂 **Category Management** - Create custom categories with color coding
- 🔍 **Advanced Filtering** - Filter by category, date range, weekly/monthly periods
- 📊 **Summary Dashboard** - Total income, expenses, net amount, and current balance
- 📈 **Interactive Charts** - Pie charts for category breakdown and bar charts for monthly trends
- 📤 **Export to CSV** - Download filtered transaction data
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Advanced Features (Future-Ready)
- 🔐 **JWT Authentication** - Multi-user support with secure token-based auth
- 🔄 **Recurring Transactions** - Set up automatic recurring income/expenses
- 🎯 **Budget Goals** - Set and track spending limits per category
- 🏷️ **Tags & Notes** - Add metadata and track transaction history
- 💱 **Multi-Currency** - Support for different currencies with exchange rates
- 🗂️ **Soft Delete & Recovery** - Trash bin for recovering deleted items

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Chart.js** - Beautiful, responsive charts
- **Axios** - HTTP client for API communication
- **date-fns** - Date manipulation and formatting
- **Pure CSS** - Custom styled components

### Backend
- **Flask** - Lightweight Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **MySQL Connector** - Database connectivity
- **PyJWT** - JSON Web Token implementation
- **bcrypt** - Password hashing

### Database
- **MySQL** - Relational database with optimized schema
- **Comprehensive indexing** - For fast query performance
- **Foreign key constraints** - Data integrity

## 📁 Project Structure

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
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Summary/
│   │   │   ├── TransactionTable/
│   │   │   ├── TransactionModal/
│   │   │   ├── CategoryModal/
│   │   │   └── Charts/
│   │   ├── services/
│   │   │   └── apiService.js # API communication
│   │   ├── App.js          # Main application
│   │   ├── App.css         # Global styles
│   │   └── index.js        # React entry point
│   └── package.json        # Node.js dependencies
├── database/
│   └── schema.sql          # Database schema
└── README.md               # This file
```

## 🔧 Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)

### 1. Database Setup

1. **Create MySQL Database:**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE spend_tracker;
   ```

2. **Import Schema:**
   ```bash
   mysql -u root -p spend_tracker < database/schema.sql
   ```

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables (optional):**
   ```bash
   export DB_HOST=localhost
   export DB_NAME=spend_tracker
   export DB_USER=root
   export DB_PASSWORD=your_password
   export SECRET_KEY=your-secret-key-here
   ```

5. **Run the Flask application:**
   ```bash
   python app.py
   ```
   Backend will be available at `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   Frontend will be available at `http://localhost:3000`

## 🎯 Usage Guide

### Adding Transactions
1. Click **"Add Transaction"** in the header
2. Fill in the transaction details:
   - **Date**: When the transaction occurred
   - **Category**: Select from existing categories
   - **Description**: Brief description of the transaction
   - **Type**: Choose Income or Expense
   - **Amount**: Enter the amount

### Managing Categories
1. Click **"Add Category"** in the header
2. Enter category name and choose a color
3. Preview your category before saving
4. Delete categories from the sidebar (hover to see delete button)

### Filtering Transactions
- **By Category**: Click on any category in the sidebar
- **By Date**: Use custom date range or select weekly/monthly periods
- **Clear Filters**: Use the "Clear Filters" button to reset

### Viewing Analytics
- **Category Breakdown**: Pie chart showing spending by category
- **Monthly Trends**: Bar chart showing income, expenses, and net over time
- Switch between chart views using the tabs

### Exporting Data
- Click **"Export CSV"** to download your filtered transaction data
- File includes date, category, description, amounts, and running balance

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (prepared for future use)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `DELETE /api/categories/{id}` - Delete category

### Transactions
- `GET /api/transactions` - Get transactions with filters
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Summary & Analytics
- `GET /api/summary` - Get financial summary
- `GET /api/charts/category-spending` - Category spending data
- `GET /api/charts/monthly-trend` - Monthly trend data

### Export
- `GET /api/export/csv` - Export transactions as CSV

## 🔮 Future Enhancements

### Phase 1 - User Management
- User registration and authentication
- Password reset functionality
- User profile management

### Phase 2 - Advanced Features
- Recurring transactions setup
- Budget goals and alerts
- Transaction tags and notes
- Audit trail for changes

### Phase 3 - Extended Functionality
- Multi-currency support
- Bank account integration
- Receipt image uploads
- Spending insights and recommendations

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in environment variables
   - Ensure database exists and schema is imported

2. **Port Already in Use**
   - Backend: Change port in `app.py` (default: 5000)
   - Frontend: Set `PORT=3001` environment variable

3. **CORS Issues**
   - Ensure Flask-CORS is installed and configured
   - Check API base URL in `apiService.js`

4. **Missing Dependencies**
   - Backend: Run `pip install -r requirements.txt`
   - Frontend: Run `npm install`

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Search existing issues on GitHub
3. Create a new issue with detailed description

---

**Built with ❤️ for better financial management** 
