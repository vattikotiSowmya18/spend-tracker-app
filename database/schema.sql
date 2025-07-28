-- Spend Tracker Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS spend_tracker;
USE spend_tracker;

-- Users table for multi-user support
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3498db',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name, status)
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    credited DECIMAL(10, 2) DEFAULT 0.00,
    debited DECIMAL(10, 2) DEFAULT 0.00,
    balance DECIMAL(10, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_category (category_id),
    INDEX idx_status (status)
);

-- Recurring transactions table
CREATE TABLE recurring_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    credited DECIMAL(10, 2) DEFAULT 0.00,
    debited DECIMAL(10, 2) DEFAULT 0.00,
    recurrence_type ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    recurrence_interval INT DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    next_execution DATE NOT NULL,
    last_executed DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Budget goals table
CREATE TABLE goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    goal_type ENUM('monthly', 'yearly') NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_user_category_period (user_id, category_id, goal_type, period_start)
);

-- Tags table
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#95a5a6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tag (user_id, name, status)
);

-- Transaction tags mapping table
CREATE TABLE transaction_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_tag (transaction_id, tag_id)
);

-- Audit log table
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE') NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user_date (user_id, created_at)
);

-- Exchange rates table for multi-currency support
CREATE TABLE exchange_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_currency CHAR(3) NOT NULL,
    to_currency CHAR(3) NOT NULL,
    rate DECIMAL(10, 6) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_date (from_currency, to_currency, date)
);

-- Trash bin for soft deleted items recovery
CREATE TABLE trash_bin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    record_data JSON NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_table (user_id, table_name),
    INDEX idx_deleted_at (deleted_at)
);

-- Insert default categories for new users
INSERT INTO users (username, email, password_hash) VALUES 
('demo_user', 'demo@example.com', '$2b$12$demo_hash_placeholder');

SET @demo_user_id = LAST_INSERT_ID();

INSERT INTO categories (user_id, name, color) VALUES
(@demo_user_id, 'Food & Dining', '#e74c3c'),
(@demo_user_id, 'Transportation', '#3498db'),
(@demo_user_id, 'Shopping', '#f39c12'),
(@demo_user_id, 'Entertainment', '#9b59b6'),
(@demo_user_id, 'Bills & Utilities', '#34495e'),
(@demo_user_id, 'Healthcare', '#1abc9c'),
(@demo_user_id, 'Education', '#2ecc71'),
(@demo_user_id, 'Travel', '#e67e22'),
(@demo_user_id, 'Income', '#27ae60'),
(@demo_user_id, 'Other', '#95a5a6');

-- Sample transactions
INSERT INTO transactions (user_id, category_id, description, credited, debited, balance, transaction_date) VALUES
(@demo_user_id, (SELECT id FROM categories WHERE name = 'Income' AND user_id = @demo_user_id), 'Salary', 5000.00, 0.00, 5000.00, '2024-01-01'),
(@demo_user_id, (SELECT id FROM categories WHERE name = 'Food & Dining' AND user_id = @demo_user_id), 'Lunch at restaurant', 0.00, 25.50, 4974.50, '2024-01-02'),
(@demo_user_id, (SELECT id FROM categories WHERE name = 'Transportation' AND user_id = @demo_user_id), 'Gas station', 0.00, 40.00, 4934.50, '2024-01-02'),
(@demo_user_id, (SELECT id FROM categories WHERE name = 'Bills & Utilities' AND user_id = @demo_user_id), 'Electricity bill', 0.00, 120.75, 4813.75, '2024-01-03'),
(@demo_user_id, (SELECT id FROM categories WHERE name = 'Shopping' AND user_id = @demo_user_id), 'Groceries', 0.00, 85.25, 4728.50, '2024-01-04'),
(@demo_user_id, (SELECT id FROM categories WHERE name = 'Entertainment' AND user_id = @demo_user_id), 'Movie tickets', 0.00, 32.00, 4696.50, '2024-01-05');