import React from 'react';
import './TransactionSummary.css';

const TransactionSummary = ({ summary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const summaryCards = [
    {
      title: 'Total Income',
      value: summary.total_credited || 0,
      icon: '💰',
      type: 'income',
      description: 'Total credited amount'
    },
    {
      title: 'Total Expenses',
      value: summary.total_debited || 0,
      icon: '💸',
      type: 'expense',
      description: 'Total debited amount'
    },
    {
      title: 'Net Balance',
      value: summary.net_amount || 0,
      icon: '📊',
      type: 'balance',
      description: 'Income minus expenses'
    },
    {
      title: 'Current Balance',
      value: summary.current_balance || 0,
      icon: '🏦',
      type: 'current',
      description: 'Account balance'
    }
  ];

  return (
    <div className="transaction-summary">
      <div className="summary-header">
        <h3>📈 Financial Summary</h3>
        <span className="summary-count">
          {summary.total_transactions || 0} transactions
        </span>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, index) => (
          <div key={index} className={`summary-card ${card.type}`}>
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <span className="card-title">{card.title}</span>
            </div>
            <div className="card-content">
              <div className={`card-value ${card.value >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(Math.abs(card.value))}
                {card.value < 0 && <span className="negative-indicator">-</span>}
              </div>
              <div className="card-description">
                {card.description}
              </div>
            </div>
            
            {/* Add trend indicator for some cards */}
            {card.type === 'balance' && (
              <div className={`trend-indicator ${card.value >= 0 ? 'positive' : 'negative'}`}>
                {card.value >= 0 ? '↗️' : '↘️'}
                <span>{card.value >= 0 ? 'Positive' : 'Negative'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional insights */}
      <div className="summary-insights">
        {summary.total_credited > 0 && summary.total_debited > 0 && (
          <div className="insight-item">
            <span className="insight-label">Expense Ratio:</span>
            <span className="insight-value">
              {((summary.total_debited / summary.total_credited) * 100).toFixed(1)}%
            </span>
          </div>
        )}
        
        {summary.total_transactions > 0 && (
          <div className="insight-item">
            <span className="insight-label">Avg. Transaction:</span>
            <span className="insight-value">
              {formatCurrency((summary.total_credited + summary.total_debited) / (summary.total_transactions * 2))}
            </span>
          </div>
        )}
        
        {summary.total_credited > summary.total_debited && (
          <div className="insight-item positive">
            <span className="insight-icon">✅</span>
            <span className="insight-text">You're saving money this period!</span>
          </div>
        )}
        
        {summary.total_debited > summary.total_credited && (
          <div className="insight-item warning">
            <span className="insight-icon">⚠️</span>
            <span className="insight-text">Expenses exceed income this period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionSummary;