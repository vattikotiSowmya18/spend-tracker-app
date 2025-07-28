import React from 'react';
import { format, parseISO } from 'date-fns';
import './TransactionList.css';

const TransactionList = ({ transactions, categories, onEdit, onDelete }) => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#6c757d';
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list">
        <div className="list-header">
          <h3>📋 Transactions</h3>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h4>No transactions found</h4>
          <p>Start by adding your first transaction using the "Add Transaction" button.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="list-header">
        <h3>📋 Transactions ({transactions.length})</h3>
      </div>

      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Credited</th>
              <th>Debited</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="transaction-row">
                <td className="date-cell">
                  {formatDate(transaction.transaction_date)}
                </td>
                
                <td className="category-cell">
                  <div className="category-badge">
                    <span 
                      className="category-indicator"
                      style={{ backgroundColor: getCategoryColor(transaction.category_id) }}
                    ></span>
                    <span className="category-text">
                      {getCategoryName(transaction.category_id)}
                    </span>
                  </div>
                </td>
                
                <td className="description-cell">
                  <div className="description-content">
                    <span className="description-text">
                      {transaction.description}
                    </span>
                    {transaction.notes && (
                      <span className="notes-text" title={transaction.notes}>
                        📝 {transaction.notes.length > 30 
                          ? transaction.notes.substring(0, 30) + '...' 
                          : transaction.notes
                        }
                      </span>
                    )}
                  </div>
                </td>
                
                <td className={`amount-cell credited ${transaction.credited > 0 ? 'positive' : ''}`}>
                  {transaction.credited > 0 ? formatCurrency(transaction.credited) : '-'}
                </td>
                
                <td className={`amount-cell debited ${transaction.debited > 0 ? 'negative' : ''}`}>
                  {transaction.debited > 0 ? formatCurrency(transaction.debited) : '-'}
                </td>
                
                <td className={`balance-cell ${transaction.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(transaction.balance)}
                </td>
                
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(transaction)}
                      title="Edit Transaction"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(transaction.id)}
                      title="Delete Transaction"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > 10 && (
        <div className="table-footer">
          <p>Showing {transactions.length} transactions</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;