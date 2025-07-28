import React from 'react';
import { format } from 'date-fns';
import './TransactionTable.css';

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-table-container card">
        <div className="table-header">
          <h3 className="table-title">📋 Transactions</h3>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h4>No transactions found</h4>
          <p>Start by adding your first transaction or adjust your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-table-container card">
      <div className="table-header">
        <h3 className="table-title">📋 Transactions</h3>
        <div className="table-info">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Income</th>
              <th>Expense</th>
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
                  <div className="category-display">
                    <span 
                      className="category-color-indicator"
                      style={{ backgroundColor: transaction.category_color }}
                    ></span>
                    <span className="category-name">
                      {transaction.category_name}
                    </span>
                  </div>
                </td>
                <td className="description-cell">
                  <div className="description-text" title={transaction.description}>
                    {transaction.description}
                  </div>
                </td>
                <td className="amount-cell income">
                  {transaction.credited > 0 ? formatCurrency(transaction.credited) : '-'}
                </td>
                <td className="amount-cell expense">
                  {transaction.debited > 0 ? formatCurrency(transaction.debited) : '-'}
                </td>
                <td className="amount-cell balance">
                  <span className={`balance-amount ${transaction.balance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(transaction.balance)}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(transaction)}
                      title="Edit transaction"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(transaction.id)}
                      title="Delete transaction"
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
    </div>
  );
};

export default TransactionTable;