from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime, timedelta
import csv
import io
from decimal import Decimal
import bcrypt
import jwt
import os
from functools import wraps

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'database': os.environ.get('DB_NAME', 'spend_tracker'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', '')
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def decimal_to_float(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def token_required(f):
    """Decorator for routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            # For demo purposes, use default user
            request.current_user_id = 1
            return f(*args, **kwargs)
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.current_user_id = data['user_id']
        except:
            request.current_user_id = 1  # Default for demo
        
        return f(*args, **kwargs)
    return decorated

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Authentication routes (prepared for future use)
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s AND status = 'active'", (username,))
        user = cursor.fetchone()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            token = jwt.encode({
                'user_id': user['id'],
                'username': user['username'],
                'exp': datetime.utcnow() + timedelta(days=7)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Categories routes
@app.route('/api/categories', methods=['GET'])
@token_required
def get_categories():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, name, color, created_at 
            FROM categories 
            WHERE user_id = %s AND status = 'active'
            ORDER BY name
        """, (request.current_user_id,))
        
        categories = cursor.fetchall()
        
        # Convert datetime objects to strings
        for category in categories:
            if category['created_at']:
                category['created_at'] = category['created_at'].isoformat()
        
        return jsonify({'success': True, 'data': categories})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/categories', methods=['POST'])
@token_required
def add_category():
    try:
        data = request.get_json()
        name = data.get('name')
        color = data.get('color', '#3498db')
        
        if not name:
            return jsonify({'error': 'Category name is required'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO categories (user_id, name, color)
            VALUES (%s, %s, %s)
        """, (request.current_user_id, name, color))
        
        connection.commit()
        category_id = cursor.lastrowid
        
        return jsonify({
            'success': True,
            'message': 'Category added successfully',
            'data': {'id': category_id, 'name': name, 'color': color}
        })
        
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Category name already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@token_required
def delete_category(category_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        
        # Soft delete
        cursor.execute("""
            UPDATE categories 
            SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
        """, (category_id, request.current_user_id))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Category not found'}), 404
            
        connection.commit()
        
        return jsonify({'success': True, 'message': 'Category deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Transactions routes
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions():
    try:
        # Get query parameters for filtering
        category_id = request.args.get('category_id')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        offset = (page - 1) * limit
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Build query with filters
        where_conditions = ["t.user_id = %s", "t.status = 'active'"]
        params = [request.current_user_id]
        
        if category_id and category_id != 'all':
            where_conditions.append("t.category_id = %s")
            params.append(category_id)
            
        if from_date:
            where_conditions.append("t.transaction_date >= %s")
            params.append(from_date)
            
        if to_date:
            where_conditions.append("t.transaction_date <= %s")
            params.append(to_date)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get transactions with category info
        query = f"""
            SELECT t.id, t.description, t.credited, t.debited, t.balance,
                   t.transaction_date, t.created_at, c.name as category_name, c.color as category_color
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE {where_clause}
            ORDER BY t.transaction_date DESC, t.created_at DESC
            LIMIT %s OFFSET %s
        """
        
        params.extend([limit, offset])
        cursor.execute(query, params)
        transactions = cursor.fetchall()
        
        # Get total count for pagination
        count_query = f"""
            SELECT COUNT(*) as total
            FROM transactions t
            WHERE {where_clause}
        """
        cursor.execute(count_query, params[:-2])  # Exclude limit and offset
        total_count = cursor.fetchone()['total']
        
        # Convert dates and decimals
        for transaction in transactions:
            transaction['credited'] = float(transaction['credited'])
            transaction['debited'] = float(transaction['debited'])
            transaction['balance'] = float(transaction['balance'])
            transaction['transaction_date'] = transaction['transaction_date'].isoformat()
            transaction['created_at'] = transaction['created_at'].isoformat()
        
        return jsonify({
            'success': True,
            'data': transactions,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/transactions', methods=['POST'])
@token_required
def add_transaction():
    try:
        data = request.get_json()
        category_id = data.get('category_id')
        description = data.get('description')
        credited = float(data.get('credited', 0))
        debited = float(data.get('debited', 0))
        transaction_date = data.get('transaction_date')
        
        if not all([category_id, description, transaction_date]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        if credited < 0 or debited < 0:
            return jsonify({'error': 'Amounts cannot be negative'}), 400
            
        if credited > 0 and debited > 0:
            return jsonify({'error': 'Transaction cannot have both credit and debit'}), 400
            
        if credited == 0 and debited == 0:
            return jsonify({'error': 'Transaction must have either credit or debit amount'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Get current balance (latest transaction)
        cursor.execute("""
            SELECT balance FROM transactions 
            WHERE user_id = %s AND status = 'active'
            ORDER BY transaction_date DESC, created_at DESC 
            LIMIT 1
        """, (request.current_user_id,))
        
        result = cursor.fetchone()
        current_balance = float(result['balance']) if result else 0.0
        
        # Calculate new balance
        new_balance = current_balance + credited - debited
        
        # Insert transaction
        cursor.execute("""
            INSERT INTO transactions (user_id, category_id, description, credited, debited, balance, transaction_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (request.current_user_id, category_id, description, credited, debited, new_balance, transaction_date))
        
        connection.commit()
        transaction_id = cursor.lastrowid
        
        # Update balances for transactions after this date
        cursor.execute("""
            SELECT id, credited, debited FROM transactions
            WHERE user_id = %s AND status = 'active' AND 
                  (transaction_date > %s OR (transaction_date = %s AND created_at > (SELECT created_at FROM transactions WHERE id = %s)))
            ORDER BY transaction_date ASC, created_at ASC
        """, (request.current_user_id, transaction_date, transaction_date, transaction_id))
        
        future_transactions = cursor.fetchall()
        current_bal = new_balance
        
        for trans in future_transactions:
            current_bal = current_bal + float(trans['credited']) - float(trans['debited'])
            cursor.execute("""
                UPDATE transactions SET balance = %s WHERE id = %s
            """, (current_bal, trans['id']))
        
        connection.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transaction added successfully',
            'data': {
                'id': transaction_id,
                'balance': new_balance
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
@token_required
def update_transaction(transaction_id):
    try:
        data = request.get_json()
        category_id = data.get('category_id')
        description = data.get('description')
        credited = float(data.get('credited', 0))
        debited = float(data.get('debited', 0))
        transaction_date = data.get('transaction_date')
        
        if not all([category_id, description, transaction_date]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Get original transaction
        cursor.execute("""
            SELECT * FROM transactions 
            WHERE id = %s AND user_id = %s AND status = 'active'
        """, (transaction_id, request.current_user_id))
        
        original = cursor.fetchone()
        if not original:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Update transaction
        cursor.execute("""
            UPDATE transactions 
            SET category_id = %s, description = %s, credited = %s, debited = %s, 
                transaction_date = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
        """, (category_id, description, credited, debited, transaction_date, transaction_id, request.current_user_id))
        
        # Recalculate all balances (simple approach for demo)
        cursor.execute("""
            SELECT id, credited, debited, transaction_date, created_at
            FROM transactions 
            WHERE user_id = %s AND status = 'active'
            ORDER BY transaction_date ASC, created_at ASC
        """, (request.current_user_id,))
        
        all_transactions = cursor.fetchall()
        running_balance = 0.0
        
        for trans in all_transactions:
            running_balance += float(trans['credited']) - float(trans['debited'])
            cursor.execute("""
                UPDATE transactions SET balance = %s WHERE id = %s
            """, (running_balance, trans['id']))
        
        connection.commit()
        
        return jsonify({'success': True, 'message': 'Transaction updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(transaction_id):
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor()
        
        # Soft delete
        cursor.execute("""
            UPDATE transactions 
            SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND user_id = %s
        """, (transaction_id, request.current_user_id))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Recalculate balances for remaining transactions
        cursor.execute("""
            SELECT id, credited, debited FROM transactions
            WHERE user_id = %s AND status = 'active'
            ORDER BY transaction_date ASC, created_at ASC
        """, (request.current_user_id,))
        
        transactions = cursor.fetchall()
        running_balance = 0.0
        
        for trans in transactions:
            running_balance += float(trans['credited']) - float(trans['debited'])
            cursor.execute("""
                UPDATE transactions SET balance = %s WHERE id = %s
            """, (running_balance, trans['id']))
        
        connection.commit()
        
        return jsonify({'success': True, 'message': 'Transaction deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Summary routes
@app.route('/api/summary', methods=['GET'])
@token_required
def get_summary():
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        category_id = request.args.get('category_id')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Build where clause
        where_conditions = ["user_id = %s", "status = 'active'"]
        params = [request.current_user_id]
        
        if category_id and category_id != 'all':
            where_conditions.append("category_id = %s")
            params.append(category_id)
            
        if from_date:
            where_conditions.append("transaction_date >= %s")
            params.append(from_date)
            
        if to_date:
            where_conditions.append("transaction_date <= %s")
            params.append(to_date)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get summary
        cursor.execute(f"""
            SELECT 
                SUM(credited) as total_credited,
                SUM(debited) as total_debited,
                COUNT(*) as transaction_count
            FROM transactions 
            WHERE {where_clause}
        """, params)
        
        summary = cursor.fetchone()
        
        # Get current balance (latest transaction)
        cursor.execute("""
            SELECT balance FROM transactions 
            WHERE user_id = %s AND status = 'active'
            ORDER BY transaction_date DESC, created_at DESC 
            LIMIT 1
        """, (request.current_user_id,))
        
        balance_result = cursor.fetchone()
        current_balance = float(balance_result['balance']) if balance_result else 0.0
        
        total_credited = float(summary['total_credited'] or 0)
        total_debited = float(summary['total_debited'] or 0)
        net_amount = total_credited - total_debited
        
        return jsonify({
            'success': True,
            'data': {
                'total_credited': total_credited,
                'total_debited': total_debited,
                'net_amount': net_amount,
                'current_balance': current_balance,
                'transaction_count': summary['transaction_count']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Charts data routes
@app.route('/api/charts/category-spending', methods=['GET'])
@token_required
def get_category_spending():
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Build where clause
        where_conditions = ["t.user_id = %s", "t.status = 'active'"]
        params = [request.current_user_id]
        
        if from_date:
            where_conditions.append("t.transaction_date >= %s")
            params.append(from_date)
            
        if to_date:
            where_conditions.append("t.transaction_date <= %s")
            params.append(to_date)
        
        where_clause = " AND ".join(where_conditions)
        
        cursor.execute(f"""
            SELECT c.name, c.color, SUM(t.debited) as total_spent
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE {where_clause}
            GROUP BY c.id, c.name, c.color
            HAVING total_spent > 0
            ORDER BY total_spent DESC
        """, params)
        
        data = cursor.fetchall()
        
        # Convert to chart format
        chart_data = []
        for row in data:
            chart_data.append({
                'category': row['name'],
                'amount': float(row['total_spent']),
                'color': row['color']
            })
        
        return jsonify({'success': True, 'data': chart_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/charts/monthly-trend', methods=['GET'])
@token_required
def get_monthly_trend():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                DATE_FORMAT(transaction_date, '%Y-%m') as month,
                SUM(credited) as total_credited,
                SUM(debited) as total_debited
            FROM transactions
            WHERE user_id = %s AND status = 'active'
                AND transaction_date >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month
        """, (request.current_user_id,))
        
        data = cursor.fetchall()
        
        chart_data = []
        for row in data:
            chart_data.append({
                'month': row['month'],
                'credited': float(row['total_credited'] or 0),
                'debited': float(row['total_debited'] or 0),
                'net': float(row['total_credited'] or 0) - float(row['total_debited'] or 0)
            })
        
        return jsonify({'success': True, 'data': chart_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Export route
@app.route('/api/export/csv', methods=['GET'])
@token_required
def export_csv():
    try:
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        category_id = request.args.get('category_id')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cursor = connection.cursor(dictionary=True)
        
        # Build where clause
        where_conditions = ["t.user_id = %s", "t.status = 'active'"]
        params = [request.current_user_id]
        
        if category_id and category_id != 'all':
            where_conditions.append("t.category_id = %s")
            params.append(category_id)
            
        if from_date:
            where_conditions.append("t.transaction_date >= %s")
            params.append(from_date)
            
        if to_date:
            where_conditions.append("t.transaction_date <= %s")
            params.append(to_date)
        
        where_clause = " AND ".join(where_conditions)
        
        cursor.execute(f"""
            SELECT t.transaction_date, c.name as category, t.description,
                   t.credited, t.debited, t.balance
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE {where_clause}
            ORDER BY t.transaction_date DESC
        """, params)
        
        transactions = cursor.fetchall()
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Date', 'Category', 'Description', 'Credited', 'Debited', 'Balance'])
        
        # Write data
        for transaction in transactions:
            writer.writerow([
                transaction['transaction_date'],
                transaction['category'],
                transaction['description'],
                float(transaction['credited']),
                float(transaction['debited']),
                float(transaction['balance'])
            ])
        
        output.seek(0)
        csv_data = output.getvalue()
        
        return jsonify({
            'success': True,
            'data': csv_data,
            'filename': f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)