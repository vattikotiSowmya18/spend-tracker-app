"""
Spend Tracker Backend API
Flask application with MySQL database integration
Supports JWT authentication and comprehensive transaction management
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import jwt
import bcrypt
from datetime import datetime, timedelta, date
import json
import csv
import io
import os
from functools import wraps
import logging

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'spend_tracker',
    'user': 'root',
    'password': 'password'  # Change this in production
}

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Database connection error: {e}")
        return None

def create_response(success=True, data=None, message="", status_code=200):
    """Standardized API response format"""
    response = {
        'success': success,
        'message': message,
        'data': data,
        'timestamp': datetime.now().isoformat()
    }
    return jsonify(response), status_code

def token_required(f):
    """JWT token validation decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return create_response(False, message="Token is missing", status_code=401)
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return create_response(False, message="Token has expired", status_code=401)
        except jwt.InvalidTokenError:
            return create_response(False, message="Token is invalid", status_code=401)
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if not all([username, email, password]):
            return create_response(False, message="Username, email, and password are required", status_code=400)
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor()
        query = """
        INSERT INTO users (username, email, password_hash, first_name, last_name)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (username, email, password_hash, first_name, last_name))
        connection.commit()
        
        user_id = cursor.lastrowid
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'username': username,
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        cursor.close()
        connection.close()
        
        return create_response(True, {
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        }, "User registered successfully")
        
    except mysql.connector.IntegrityError:
        return create_response(False, message="Username or email already exists", status_code=409)
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return create_response(False, message="Registration failed", status_code=500)

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return create_response(False, message="Username and password are required", status_code=400)
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE username = %s AND is_active = TRUE"
        cursor.execute(query, (username,))
        user = cursor.fetchone()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return create_response(False, message="Invalid credentials", status_code=401)
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        cursor.close()
        connection.close()
        
        return create_response(True, {
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        }, "Login successful")
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return create_response(False, message="Login failed", status_code=500)

# Demo login for development
@app.route('/api/auth/demo-login', methods=['POST'])
def demo_login():
    """Demo login for development/testing"""
    try:
        # Use the demo user created in schema
        token = jwt.encode({
            'user_id': 1,
            'username': 'demo_user',
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return create_response(True, {
            'token': token,
            'user': {
                'id': 1,
                'username': 'demo_user',
                'email': 'demo@spendtracker.com',
                'first_name': 'Demo',
                'last_name': 'User'
            }
        }, "Demo login successful")
        
    except Exception as e:
        logger.error(f"Demo login error: {e}")
        return create_response(False, message="Demo login failed", status_code=500)

# Categories Routes
@app.route('/api/categories', methods=['GET'])
@token_required
def get_categories(current_user_id):
    """Get all active categories for the user"""
    try:
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT * FROM categories 
        WHERE (user_id = %s OR user_id IS NULL) AND is_active = TRUE 
        ORDER BY name
        """
        cursor.execute(query, (current_user_id,))
        categories = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return create_response(True, categories)
        
    except Exception as e:
        logger.error(f"Get categories error: {e}")
        return create_response(False, message="Failed to fetch categories", status_code=500)

@app.route('/api/categories', methods=['POST'])
@token_required
def add_category(current_user_id):
    """Add a new category"""
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        color = data.get('color', '#007bff')
        icon = data.get('icon', 'category')
        
        if not name:
            return create_response(False, message="Category name is required", status_code=400)
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor()
        query = """
        INSERT INTO categories (user_id, name, description, color, icon)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (current_user_id, name, description, color, icon))
        connection.commit()
        
        category_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return create_response(True, {'id': category_id}, "Category added successfully")
        
    except Exception as e:
        logger.error(f"Add category error: {e}")
        return create_response(False, message="Failed to add category", status_code=500)

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@token_required
def delete_category(current_user_id, category_id):
    """Soft delete a category"""
    try:
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor()
        query = "UPDATE categories SET is_active = FALSE WHERE id = %s AND user_id = %s"
        cursor.execute(query, (category_id, current_user_id))
        connection.commit()
        
        if cursor.rowcount == 0:
            return create_response(False, message="Category not found", status_code=404)
        
        cursor.close()
        connection.close()
        
        return create_response(True, message="Category deleted successfully")
        
    except Exception as e:
        logger.error(f"Delete category error: {e}")
        return create_response(False, message="Failed to delete category", status_code=500)

# Transactions Routes
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user_id):
    """Get transactions with optional filtering"""
    try:
        # Get query parameters for filtering
        category_id = request.args.get('category_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        
        # Base query
        query = """
        SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = %s AND t.is_active = TRUE
        """
        params = [current_user_id]
        
        # Add filters
        if category_id and category_id != 'all':
            query += " AND t.category_id = %s"
            params.append(category_id)
        
        if from_date:
            query += " AND t.transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND t.transaction_date <= %s"
            params.append(to_date)
        
        query += " ORDER BY t.transaction_date DESC, t.created_at DESC"
        query += " LIMIT %s OFFSET %s"
        params.extend([limit, (page - 1) * limit])
        
        cursor.execute(query, params)
        transactions = cursor.fetchall()
        
        # Convert decimal values to float for JSON serialization
        for transaction in transactions:
            transaction['credited'] = float(transaction['credited'])
            transaction['debited'] = float(transaction['debited'])
            transaction['balance'] = float(transaction['balance'])
            if transaction['transaction_date']:
                transaction['transaction_date'] = transaction['transaction_date'].isoformat()
        
        # Get total count for pagination
        count_query = """
        SELECT COUNT(*) as total
        FROM transactions t
        WHERE t.user_id = %s AND t.is_active = TRUE
        """
        count_params = [current_user_id]
        
        if category_id and category_id != 'all':
            count_query += " AND t.category_id = %s"
            count_params.append(category_id)
        
        if from_date:
            count_query += " AND t.transaction_date >= %s"
            count_params.append(from_date)
        
        if to_date:
            count_query += " AND t.transaction_date <= %s"
            count_params.append(to_date)
        
        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()['total']
        
        cursor.close()
        connection.close()
        
        return create_response(True, {
            'transactions': transactions,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Get transactions error: {e}")
        return create_response(False, message="Failed to fetch transactions", status_code=500)

@app.route('/api/transactions', methods=['POST'])
@token_required
def add_transaction(current_user_id):
    """Add a new transaction"""
    try:
        data = request.get_json()
        category_id = data.get('category_id')
        transaction_date = data.get('transaction_date')
        description = data.get('description')
        credited = float(data.get('credited', 0))
        debited = float(data.get('debited', 0))
        notes = data.get('notes', '')
        
        if not all([category_id, transaction_date, description]):
            return create_response(False, message="Category, date, and description are required", status_code=400)
        
        if credited == 0 and debited == 0:
            return create_response(False, message="Either credited or debited amount must be greater than 0", status_code=400)
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        
        # Calculate new balance
        balance_query = """
        SELECT COALESCE(MAX(balance), 0) as current_balance
        FROM transactions
        WHERE user_id = %s AND is_active = TRUE
        """
        cursor.execute(balance_query, (current_user_id,))
        result = cursor.fetchone()
        current_balance = float(result['current_balance'])
        new_balance = current_balance + credited - debited
        
        # Insert transaction
        insert_query = """
        INSERT INTO transactions (user_id, category_id, transaction_date, description, credited, debited, balance, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            current_user_id, category_id, transaction_date, description, 
            credited, debited, new_balance, notes
        ))
        connection.commit()
        
        transaction_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return create_response(True, {'id': transaction_id, 'balance': new_balance}, "Transaction added successfully")
        
    except Exception as e:
        logger.error(f"Add transaction error: {e}")
        return create_response(False, message="Failed to add transaction", status_code=500)

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
@token_required
def update_transaction(current_user_id, transaction_id):
    """Update an existing transaction"""
    try:
        data = request.get_json()
        category_id = data.get('category_id')
        transaction_date = data.get('transaction_date')
        description = data.get('description')
        credited = float(data.get('credited', 0))
        debited = float(data.get('debited', 0))
        notes = data.get('notes', '')
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor()
        
        # Get old transaction to calculate balance difference
        cursor.execute("""
        SELECT credited, debited FROM transactions 
        WHERE id = %s AND user_id = %s AND is_active = TRUE
        """, (transaction_id, current_user_id))
        
        old_transaction = cursor.fetchone()
        if not old_transaction:
            return create_response(False, message="Transaction not found", status_code=404)
        
        old_credited, old_debited = old_transaction
        balance_diff = (credited - float(old_credited)) - (debited - float(old_debited))
        
        # Update transaction
        update_query = """
        UPDATE transactions 
        SET category_id = %s, transaction_date = %s, description = %s, 
            credited = %s, debited = %s, notes = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND user_id = %s AND is_active = TRUE
        """
        cursor.execute(update_query, (
            category_id, transaction_date, description, credited, debited, notes,
            transaction_id, current_user_id
        ))
        
        # Update balance for this and all subsequent transactions
        cursor.execute("""
        UPDATE transactions 
        SET balance = balance + %s 
        WHERE user_id = %s AND created_at >= (
            SELECT created_at FROM transactions WHERE id = %s
        ) AND is_active = TRUE
        """, (balance_diff, current_user_id, transaction_id))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return create_response(True, message="Transaction updated successfully")
        
    except Exception as e:
        logger.error(f"Update transaction error: {e}")
        return create_response(False, message="Failed to update transaction", status_code=500)

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user_id, transaction_id):
    """Soft delete a transaction"""
    try:
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor()
        
        # Get transaction details for balance recalculation
        cursor.execute("""
        SELECT credited, debited, created_at FROM transactions 
        WHERE id = %s AND user_id = %s AND is_active = TRUE
        """, (transaction_id, current_user_id))
        
        transaction = cursor.fetchone()
        if not transaction:
            return create_response(False, message="Transaction not found", status_code=404)
        
        credited, debited, created_at = transaction
        balance_diff = float(debited) - float(credited)  # Reverse the transaction
        
        # Soft delete transaction
        cursor.execute("""
        UPDATE transactions 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND user_id = %s
        """, (transaction_id, current_user_id))
        
        # Update balance for all subsequent transactions
        cursor.execute("""
        UPDATE transactions 
        SET balance = balance + %s 
        WHERE user_id = %s AND created_at > %s AND is_active = TRUE
        """, (balance_diff, current_user_id, created_at))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return create_response(True, message="Transaction deleted successfully")
        
    except Exception as e:
        logger.error(f"Delete transaction error: {e}")
        return create_response(False, message="Failed to delete transaction", status_code=500)

# Summary and Analytics Routes
@app.route('/api/transactions/summary', methods=['GET'])
@token_required
def get_transaction_summary(current_user_id):
    """Get transaction summary (total credited, debited, balance)"""
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        category_id = request.args.get('category_id')
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT 
            SUM(credited) as total_credited,
            SUM(debited) as total_debited,
            (SUM(credited) - SUM(debited)) as net_amount,
            COUNT(*) as total_transactions
        FROM transactions 
        WHERE user_id = %s AND is_active = TRUE
        """
        params = [current_user_id]
        
        if category_id and category_id != 'all':
            query += " AND category_id = %s"
            params.append(category_id)
        
        if from_date:
            query += " AND transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND transaction_date <= %s"
            params.append(to_date)
        
        cursor.execute(query, params)
        summary = cursor.fetchone()
        
        # Get current balance
        balance_query = """
        SELECT COALESCE(MAX(balance), 0) as current_balance
        FROM transactions
        WHERE user_id = %s AND is_active = TRUE
        """
        cursor.execute(balance_query, (current_user_id,))
        balance_result = cursor.fetchone()
        
        # Convert to float and handle None values
        summary_data = {
            'total_credited': float(summary['total_credited'] or 0),
            'total_debited': float(summary['total_debited'] or 0),
            'net_amount': float(summary['net_amount'] or 0),
            'total_transactions': summary['total_transactions'] or 0,
            'current_balance': float(balance_result['current_balance'] or 0)
        }
        
        cursor.close()
        connection.close()
        
        return create_response(True, summary_data)
        
    except Exception as e:
        logger.error(f"Get summary error: {e}")
        return create_response(False, message="Failed to fetch summary", status_code=500)

@app.route('/api/analytics/category-spending', methods=['GET'])
@token_required
def get_category_spending(current_user_id):
    """Get spending by category for charts"""
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT 
            c.name as category_name,
            c.color as category_color,
            SUM(t.debited) as total_spent,
            SUM(t.credited) as total_credited,
            COUNT(t.id) as transaction_count
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = %s AND t.is_active = TRUE
        """
        params = [current_user_id]
        
        if from_date:
            query += " AND t.transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND t.transaction_date <= %s"
            params.append(to_date)
        
        query += " GROUP BY t.category_id, c.name, c.color ORDER BY total_spent DESC"
        
        cursor.execute(query, params)
        category_data = cursor.fetchall()
        
        # Convert decimal to float
        for item in category_data:
            item['total_spent'] = float(item['total_spent'] or 0)
            item['total_credited'] = float(item['total_credited'] or 0)
        
        cursor.close()
        connection.close()
        
        return create_response(True, category_data)
        
    except Exception as e:
        logger.error(f"Get category spending error: {e}")
        return create_response(False, message="Failed to fetch category spending", status_code=500)

@app.route('/api/analytics/monthly-trends', methods=['GET'])
@token_required
def get_monthly_trends(current_user_id):
    """Get monthly spending trends"""
    try:
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT 
            DATE_FORMAT(transaction_date, '%Y-%m') as month,
            SUM(debited) as total_spent,
            SUM(credited) as total_credited,
            COUNT(*) as transaction_count
        FROM transactions 
        WHERE user_id = %s AND is_active = TRUE 
        AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
        ORDER BY month DESC
        """
        
        cursor.execute(query, (current_user_id,))
        trends = cursor.fetchall()
        
        # Convert decimal to float
        for trend in trends:
            trend['total_spent'] = float(trend['total_spent'] or 0)
            trend['total_credited'] = float(trend['total_credited'] or 0)
        
        cursor.close()
        connection.close()
        
        return create_response(True, trends)
        
    except Exception as e:
        logger.error(f"Get monthly trends error: {e}")
        return create_response(False, message="Failed to fetch monthly trends", status_code=500)

# Export Routes
@app.route('/api/export/csv', methods=['GET'])
@token_required
def export_transactions_csv(current_user_id):
    """Export transactions as CSV"""
    try:
        # Get same filters as transactions endpoint
        category_id = request.args.get('category_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        connection = get_db_connection()
        if not connection:
            return create_response(False, message="Database connection failed", status_code=500)
        
        cursor = connection.cursor(dictionary=True)
        
        query = """
        SELECT 
            t.transaction_date,
            c.name as category,
            t.description,
            t.credited,
            t.debited,
            t.balance,
            t.notes
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = %s AND t.is_active = TRUE
        """
        params = [current_user_id]
        
        if category_id and category_id != 'all':
            query += " AND t.category_id = %s"
            params.append(category_id)
        
        if from_date:
            query += " AND t.transaction_date >= %s"
            params.append(from_date)
        
        if to_date:
            query += " AND t.transaction_date <= %s"
            params.append(to_date)
        
        query += " ORDER BY t.transaction_date DESC"
        
        cursor.execute(query, params)
        transactions = cursor.fetchall()
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Date', 'Category', 'Description', 'Credited', 'Debited', 'Balance', 'Notes'])
        
        # Write data
        for transaction in transactions:
            writer.writerow([
                transaction['transaction_date'],
                transaction['category'] or 'Uncategorized',
                transaction['description'],
                float(transaction['credited']),
                float(transaction['debited']),
                float(transaction['balance']),
                transaction['notes'] or ''
            ])
        
        # Create response
        output.seek(0)
        csv_data = output.getvalue()
        
        cursor.close()
        connection.close()
        
        # Return CSV file
        return create_response(True, {
            'csv_data': csv_data,
            'filename': f'transactions_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        })
        
    except Exception as e:
        logger.error(f"Export CSV error: {e}")
        return create_response(False, message="Failed to export CSV", status_code=500)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return create_response(True, {'status': 'healthy'}, "API is running")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return create_response(False, message="Endpoint not found", status_code=404)

@app.errorhandler(500)
def internal_error(error):
    return create_response(False, message="Internal server error", status_code=500)

if __name__ == '__main__':
    # Create database if it doesn't exist
    try:
        temp_config = DB_CONFIG.copy()
        temp_config.pop('database')
        temp_connection = mysql.connector.connect(**temp_config)
        temp_cursor = temp_connection.cursor()
        temp_cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        temp_connection.commit()
        temp_cursor.close()
        temp_connection.close()
        logger.info("Database checked/created successfully")
    except Exception as e:
        logger.error(f"Database creation error: {e}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)