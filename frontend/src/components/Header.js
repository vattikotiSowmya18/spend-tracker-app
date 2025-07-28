import React from 'react';
import './Header.css';

const Header = ({ user, onLogout, onAddTransaction, onExport }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">💰 Spend Tracker</h1>
        <span className="tagline">Personal Finance Manager</span>
      </div>

      <div className="header-center">
        <button 
          className="btn btn-primary"
          onClick={onAddTransaction}
        >
          ➕ Add Transaction
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={onExport}
        >
          📊 Export
        </button>
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="user-name">
            👋 {user?.first_name || user?.username || 'User'}
          </span>
          <button 
            className="btn btn-logout"
            onClick={onLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;