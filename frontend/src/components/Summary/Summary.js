import React from 'react';
import './Summary.css';

const Summary = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSummaryColor = (amount) => {
    if (amount > 0) return 'positive';
    if (amount < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className="summary card">
      <h3 className="summary-title">💰 Financial Summary</h3>
      
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Total Income</div>
          <div className="summary-value positive">
            {formatCurrency(summary.total_credited)}
          </div>
          <div className="summary-icon">💰</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-value negative">
            {formatCurrency(summary.total_debited)}
          </div>
          <div className="summary-icon">💸</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Net Amount</div>
          <div className={`summary-value ${getSummaryColor(summary.net_amount)}`}>
            {formatCurrency(summary.net_amount)}
          </div>
          <div className="summary-icon">
            {summary.net_amount >= 0 ? '📈' : '📉'}
          </div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Current Balance</div>
          <div className={`summary-value ${getSummaryColor(summary.current_balance)}`}>
            {formatCurrency(summary.current_balance)}
          </div>
          <div className="summary-icon">🏦</div>
        </div>
      </div>
      
      <div className="summary-footer">
        <div className="transaction-count">
          📊 {summary.transaction_count} transaction{summary.transaction_count !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};

export default Summary;