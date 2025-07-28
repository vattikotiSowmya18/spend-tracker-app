import React from 'react';
import './Header.css';

const Header = ({ onAddTransaction, onAddCategory, onExport }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">
            💰 Spend Tracker
          </h1>
          <p className="header-subtitle">
            Manage your personal finances with ease
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-outline header-btn"
            onClick={onAddCategory}
            title="Add new category"
          >
            <span>📁</span>
            Add Category
          </button>
          
          <button 
            className="btn btn-secondary header-btn"
            onClick={onExport}
            title="Export transactions to CSV"
          >
            <span>📊</span>
            Export CSV
          </button>
          
          <button 
            className="btn btn-primary header-btn"
            onClick={onAddTransaction}
            title="Add new transaction"
          >
            <span>➕</span>
            Add Transaction
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;