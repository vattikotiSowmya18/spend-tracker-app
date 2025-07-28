-- Sample Data for Spend Tracker Application
-- This file contains sample transactions to demonstrate the application

-- Sample transactions for the demo user
INSERT INTO transactions (user_id, category_id, transaction_date, description, credited, debited, balance, notes) VALUES
-- Starting balance (salary)
(1, 8, '2024-01-01', 'Salary - January', 5000.00, 0.00, 5000.00, 'Monthly salary payment'),

-- Week 1 transactions
(1, 1, '2024-01-02', 'Grocery shopping at Walmart', 0.00, 120.50, 4879.50, 'Weekly groceries'),
(1, 2, '2024-01-03', 'Gas for car', 0.00, 45.00, 4834.50, 'Fill up at Shell station'),
(1, 4, '2024-01-04', 'Netflix subscription', 0.00, 15.99, 4818.51, 'Monthly streaming service'),
(1, 1, '2024-01-05', 'Lunch at restaurant', 0.00, 25.00, 4793.51, 'Italian restaurant downtown'),

-- Week 2 transactions
(1, 3, '2024-01-08', 'Online shopping - Amazon', 0.00, 89.99, 4703.52, 'Books and electronics'),
(1, 5, '2024-01-10', 'Electricity bill', 0.00, 85.00, 4618.52, 'Monthly electric bill'),
(1, 6, '2024-01-12', 'Pharmacy - medication', 0.00, 32.50, 4586.02, 'Prescription medication'),
(1, 1, '2024-01-14', 'Coffee shop', 0.00, 8.50, 4577.52, 'Morning coffee'),

-- Week 3 transactions
(1, 8, '2024-01-15', 'Freelance project payment', 800.00, 0.00, 5377.52, 'Web development project'),
(1, 2, '2024-01-16', 'Uber ride', 0.00, 18.75, 5358.77, 'Ride to airport'),
(1, 4, '2024-01-18', 'Movie tickets', 0.00, 24.00, 5334.77, 'Evening show with friends'),
(1, 1, '2024-01-20', 'Grocery shopping', 0.00, 95.25, 5239.52, 'Organic foods and snacks'),

-- Week 4 transactions
(1, 5, '2024-01-22', 'Internet bill', 0.00, 60.00, 5179.52, 'Monthly internet service'),
(1, 7, '2024-01-24', 'Online course', 0.00, 49.99, 5129.53, 'React development course'),
(1, 3, '2024-01-26', 'Clothing purchase', 0.00, 120.00, 5009.53, 'Winter jacket'),
(1, 9, '2024-01-28', 'Savings transfer', 0.00, 500.00, 4509.53, 'Emergency fund contribution'),

-- February transactions
(1, 8, '2024-02-01', 'Salary - February', 5000.00, 0.00, 9509.53, 'Monthly salary payment'),
(1, 5, '2024-02-02', 'Rent payment', 0.00, 1200.00, 8309.53, 'Monthly rent'),
(1, 1, '2024-02-03', 'Grocery shopping', 0.00, 110.00, 8199.53, 'Monthly grocery haul'),
(1, 2, '2024-02-05', 'Car maintenance', 0.00, 150.00, 8049.53, 'Oil change and inspection'),

-- Investment and savings
(1, 9, '2024-02-07', 'Investment deposit', 0.00, 1000.00, 7049.53, 'Stock market investment'),
(1, 8, '2024-02-10', 'Tax refund', 650.00, 0.00, 7699.53, 'Federal tax refund'),

-- Entertainment and dining
(1, 4, '2024-02-12', 'Concert tickets', 0.00, 85.00, 7614.53, 'Live music event'),
(1, 1, '2024-02-14', 'Valentine dinner', 0.00, 95.00, 7519.53, 'Special dinner date'),

-- Health and wellness
(1, 6, '2024-02-16', 'Gym membership', 0.00, 39.99, 7479.54, 'Monthly fitness membership'),
(1, 6, '2024-02-18', 'Doctor visit', 0.00, 125.00, 7354.54, 'Annual checkup'),

-- March transactions
(1, 8, '2024-03-01', 'Salary - March', 5000.00, 0.00, 12354.54, 'Monthly salary payment'),
(1, 2, '2024-03-03', 'Flight booking', 0.00, 320.00, 12034.54, 'Spring vacation flight'),
(1, 4, '2024-03-05', 'Spotify premium', 0.00, 9.99, 12024.55, 'Music streaming service'),

-- Recent transactions for better demo
(1, 1, CURDATE() - INTERVAL 5 DAY, 'Weekly groceries', 0.00, 135.75, 11888.80, 'Fresh produce and essentials'),
(1, 2, CURDATE() - INTERVAL 4 DAY, 'Gas station', 0.00, 52.00, 11836.80, 'Weekly fuel'),
(1, 4, CURDATE() - INTERVAL 3 DAY, 'Streaming services', 0.00, 25.98, 11810.82, 'Netflix + Disney+'),
(1, 8, CURDATE() - INTERVAL 2 DAY, 'Side project income', 450.00, 0.00, 12260.82, 'Consulting work'),
(1, 1, CURDATE() - INTERVAL 1 DAY, 'Coffee and pastry', 0.00, 12.50, 12248.32, 'Morning cafe visit'),
(1, 3, CURDATE(), 'Online purchase', 0.00, 67.99, 12180.33, 'Electronic accessories');

-- Add some custom categories for the demo user
INSERT INTO categories (user_id, name, description, color, icon) VALUES
(1, 'Vacation', 'Travel and vacation expenses', '#ff6b6b', 'flight'),
(1, 'Gifts', 'Birthday and holiday gifts', '#ffeaa7', 'card_giftcard'),
(1, 'Subscriptions', 'Monthly recurring subscriptions', '#a29bfe', 'subscriptions');

-- Add some sample goals for the demo user
INSERT INTO goals (user_id, category_id, goal_type, amount, period_type, start_date, current_amount) VALUES
(1, 1, 'spending', 400.00, 'monthly', '2024-01-01', 350.00),
(1, 9, 'saving', 1000.00, 'monthly', '2024-01-01', 1500.00),
(1, 8, 'income', 5500.00, 'monthly', '2024-01-01', 5450.00);

-- Add some sample tags
INSERT INTO tags (user_id, name, color) VALUES
(1, 'Essential', '#28a745'),
(1, 'Luxury', '#dc3545'),
(1, 'Work Related', '#007bff'),
(1, 'Health', '#17a2b8');

-- Link some transactions to tags
INSERT INTO transaction_tags (transaction_id, tag_id) VALUES
(1, 1), -- Salary as essential
(2, 1), -- Groceries as essential  
(3, 1), -- Gas as essential
(4, 2), -- Netflix as luxury
(8, 1), -- Bills as essential
(15, 3), -- Freelance as work related
(22, 4); -- Gym as health