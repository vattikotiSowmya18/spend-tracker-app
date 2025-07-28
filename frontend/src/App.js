import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import TransactionTable from './components/TransactionTable/TransactionTable';
import TransactionModal from './components/TransactionModal/TransactionModal';
import CategoryModal from './components/CategoryModal/CategoryModal';
import Summary from './components/Summary/Summary';
import Charts from './components/Charts/Charts';
import { apiService } from './services/apiService';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category_id: 'all',
    from_date: '',
    to_date: ''
  });
  const [summary, setSummary] = useState({
    total_credited: 0,
    total_debited: 0,
    net_amount: 0,
    current_balance: 0,
    transaction_count: 0
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTransactions();
    loadSummary();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadTransactions(),
        loadSummary()
      ]);
    } catch (error) {
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await apiService.getTransactions(filters);
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await apiService.getSummary(filters);
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await apiService.deleteTransaction(transactionId);
        if (response.success) {
          showMessage('Transaction deleted successfully', 'success');
          loadTransactions();
          loadSummary();
        }
      } catch (error) {
        showMessage('Failed to delete transaction', 'error');
      }
    }
  };

  const handleTransactionSubmit = async (transactionData) => {
    try {
      let response;
      if (editingTransaction) {
        response = await apiService.updateTransaction(editingTransaction.id, transactionData);
      } else {
        response = await apiService.createTransaction(transactionData);
      }

      if (response.success) {
        showMessage(
          editingTransaction ? 'Transaction updated successfully' : 'Transaction added successfully',
          'success'
        );
        setShowTransactionModal(false);
        loadTransactions();
        loadSummary();
      }
    } catch (error) {
      showMessage('Failed to save transaction', 'error');
    }
  };

  const handleCategorySubmit = async (categoryData) => {
    try {
      const response = await apiService.createCategory(categoryData);
      if (response.success) {
        showMessage('Category added successfully', 'success');
        setShowCategoryModal(false);
        loadCategories();
      }
    } catch (error) {
      showMessage('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await apiService.deleteCategory(categoryId);
        if (response.success) {
          showMessage('Category deleted successfully', 'success');
          loadCategories();
        }
      } catch (error) {
        showMessage('Failed to delete category', 'error');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportTransactions(filters);
      if (response.success) {
        // Create and download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showMessage('Data exported successfully', 'success');
      }
    } catch (error) {
      showMessage('Failed to export data', 'error');
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        onAddTransaction={handleAddTransaction}
        onAddCategory={() => setShowCategoryModal(true)}
        onExport={handleExport}
      />
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="app-content">
        <Sidebar 
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onDeleteCategory={handleDeleteCategory}
        />
        
        <div className="main-content">
          <Summary summary={summary} />
          <TransactionTable 
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>

        <Charts filters={filters} />
      </div>

      {showTransactionModal && (
        <TransactionModal
          transaction={editingTransaction}
          categories={categories}
          onSubmit={handleTransactionSubmit}
          onClose={() => setShowTransactionModal(false)}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onSubmit={handleCategorySubmit}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}

export default App;