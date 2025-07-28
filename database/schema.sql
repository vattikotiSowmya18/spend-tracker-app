-- Spend Tracker Database Schema
-- MySQL Database Schema for Full-Stack Spend Tracker App

-- Users table for multi-user support
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff', -- Hex color for UI
    icon VARCHAR(50) DEFAULT 'category', -- Icon name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_categories (user_id, is_active)
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    credited DECIMAL(15, 2) DEFAULT 0.00,
    debited DECIMAL(15, 2) DEFAULT 0.00,
    balance DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_transactions (user_id, transaction_date, is_active),
    INDEX idx_category_transactions (category_id, is_active),
    INDEX idx_transaction_date (transaction_date)
);

-- Recurring transactions table
CREATE TABLE recurring_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('credit', 'debit') NOT NULL,
    recurrence_type ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    recurrence_interval INT DEFAULT 1, -- Every N days/weeks/months/years
    start_date DATE NOT NULL,
    end_date DATE NULL,
    next_due_date DATE NOT NULL,
    last_generated_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_recurring (user_id, next_due_date, is_active)
);

-- Budget goals table
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    goal_type ENUM('spending', 'saving', 'income') DEFAULT 'spending',
    amount DECIMAL(15, 2) NOT NULL,
    period_type ENUM('weekly', 'monthly', 'quarterly', 'yearly') DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_user_goals (user_id, period_type, is_active)
);

-- Tags table for transaction metadata
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6c757d',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tag (user_id, name)
);

-- Transaction tags junction table
CREATE TABLE transaction_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT,
    tag_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_tag (transaction_id, tag_id)
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_table_record (table_name, record_id),
    INDEX idx_audit_user_time (user_id, timestamp)
);

-- Exchange rates for multi-currency support
CREATE TABLE exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL, -- ISO currency code
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10, 6) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rate_date (from_currency, to_currency, effective_date),
    INDEX idx_currency_date (from_currency, to_currency, effective_date)
);

-- Trash bin for soft-deleted records
CREATE TABLE trash_bin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    record_data JSON NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by INT,
    restore_before DATE NULL, -- Auto-delete after this date
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_trash_user_table (user_id, table_name),
    INDEX idx_trash_restore_date (restore_before)
);

-- User sessions for JWT token management
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions (user_id, is_active),
    INDEX idx_token_expires (token_hash, expires_at)
);

-- Insert default categories
INSERT INTO categories (user_id, name, description, color, icon) VALUES
(NULL, 'Food & Dining', 'Restaurants, groceries, coffee', '#ff6b6b', 'restaurant'),
(NULL, 'Transportation', 'Gas, public transport, rideshare', '#4ecdc4', 'car'),
(NULL, 'Shopping', 'Clothing, electronics, general purchases', '#45b7d1', 'shopping_bag'),
(NULL, 'Entertainment', 'Movies, games, subscriptions', '#f7b731', 'movie'),
(NULL, 'Bills & Utilities', 'Rent, electricity, phone, internet', '#5f27cd', 'receipt'),
(NULL, 'Healthcare', 'Medical expenses, pharmacy, insurance', '#00d2d3', 'medical_services'),
(NULL, 'Education', 'Books, courses, training', '#ff9ff3', 'school'),
(NULL, 'Income', 'Salary, freelance, investments', '#2ed573', 'attach_money'),
(NULL, 'Savings', 'Emergency fund, investments', '#1e90ff', 'savings'),
(NULL, 'Other', 'Miscellaneous expenses', '#6c5ce7', 'category');

-- Insert default user for demo (password: 'demo123')
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('demo_user', 'demo@spendtracker.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewMC5rJWvzLhJjk6', 'Demo', 'User');

-- Insert sample exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date) VALUES
('USD', 'EUR', 0.85, CURDATE()),
('USD', 'GBP', 0.73, CURDATE()),
('USD', 'JPY', 110.00, CURDATE()),
('EUR', 'USD', 1.18, CURDATE()),
('GBP', 'USD', 1.37, CURDATE());