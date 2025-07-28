import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import TransactionSummary from './TransactionSummary';
import ChartsPanel from './ChartsPanel';
import CategoryModal from './CategoryModal';
import ExportModal from './ExportModal';
import { categoriesAPI, transactionsAPI } from '../services/api';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    category_id: 'all',
    from_date: '',
    to_date: '',
    period: 'all' // all, week, month
  });
  
  // Modal states
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Navigation states
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  
  // Success/Error message
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  useEffect(() => {
    updateDateFilters();
  }, [filters.period, currentWeekOffset, currentMonthOffset]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, transactionsRes] = await Promise.all([
        categoriesAPI.getAll(),
        transactionsAPI.getAll()
      ]);

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data.transactions);
      }
    } catch (error) {
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateDateFilters = () => {
    let fromDate = '';
    let toDate = '';
    const today = new Date();

    if (filters.period === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (currentWeekOffset * 7));
      fromDate = format(startOfWeek(weekStart), 'yyyy-MM-dd');
      toDate = format(endOfWeek(weekStart), 'yyyy-MM-dd');
    } else if (filters.period === 'month') {
      const monthDate = new Date(today);
      monthDate.setMonth(today.getMonth() + currentMonthOffset);
      fromDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      toDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
    }

    setFilters(prev => ({
      ...prev,
      from_date: fromDate,
      to_date: toDate
    }));
  };

  const applyFilters = async () => {
    try {
      const params = {};
      if (filters.category_id !== 'all') params.category_id = filters.category_id;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;

      const [transactionsRes, summaryRes] = await Promise.all([
        transactionsAPI.getAll(params),
        transactionsAPI.getSummary(params)
      ]);

      if (transactionsRes.data.success) {
        setFilteredTransactions(transactionsRes.data.data.transactions);
      }

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
    } catch (error) {
      showMessage('Failed to apply filters', 'error');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    if (newFilters.period !== filters.period) {
      setCurrentWeekOffset(0);
      setCurrentMonthOffset(0);
    }
  };

  const handlePeriodNavigation = (direction) => {
    if (filters.period === 'week') {
      setCurrentWeekOffset(prev => prev + direction);
    } else if (filters.period === 'month') {
      setCurrentMonthOffset(prev => prev + direction);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const response = await transactionsAPI.create(transactionData);
      if (response.data.success) {
        showMessage('Transaction added successfully', 'success');
        setShowTransactionForm(false);
        loadInitialData(); // Reload to get updated data
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add transaction', 'error');
    }
  };

  const handleEditTransaction = async (id, transactionData) => {
    try {
      const response = await transactionsAPI.update(id, transactionData);
      if (response.data.success) {
        showMessage('Transaction updated successfully', 'success');
        setEditingTransaction(null);
        loadInitialData();
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to update transaction', 'error');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await transactionsAPI.delete(id);
        if (response.data.success) {
          showMessage('Transaction deleted successfully', 'success');
          loadInitialData();
        }
      } catch (error) {
        showMessage(error.response?.data?.message || 'Failed to delete transaction', 'error');
      }
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      const response = await categoriesAPI.create(categoryData);
      if (response.data.success) {
        showMessage('Category added successfully', 'success');
        setShowCategoryModal(false);
        // Reload categories
        const categoriesRes = await categoriesAPI.getAll();
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }
      }
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await categoriesAPI.delete(id);
        if (response.data.success) {
          showMessage('Category deleted successfully', 'success');
          // Reload categories
          const categoriesRes = await categoriesAPI.getAll();
          if (categoriesRes.data.success) {
            setCategories(categoriesRes.data.data);
          }
        }
      } catch (error) {
        showMessage(error.response?.data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const getPeriodLabel = () => {
    if (filters.period === 'all') return 'All Time';
    
    const today = new Date();
    
    if (filters.period === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + (currentWeekOffset * 7));
      const start = startOfWeek(weekStart);
      const end = endOfWeek(weekStart);
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    }
    
    if (filters.period === 'month') {
      const monthDate = new Date(today);
      monthDate.setMonth(today.getMonth() + currentMonthOffset);
      return format(monthDate, 'MMMM yyyy');
    }
    
    return '';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header 
        user={user} 
        onLogout={onLogout}
        onAddTransaction={() => setShowTransactionForm(true)}
        onExport={() => setShowExportModal(true)}
      />
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar 
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddCategory={() => setShowCategoryModal(true)}
          onDeleteCategory={handleDeleteCategory}
          periodLabel={getPeriodLabel()}
          onPeriodNavigation={handlePeriodNavigation}
          showNavigation={filters.period !== 'all'}
        />

        <main className="main-content">
          <TransactionSummary summary={summary} />
          
          <TransactionList 
            transactions={filteredTransactions}
            categories={categories}
            onEdit={setEditingTransaction}
            onDelete={handleDeleteTransaction}
          />
        </main>

        <ChartsPanel 
          filters={filters}
          categories={categories}
        />
      </div>

      {/* Modals */}
      {showTransactionForm && (
        <TransactionForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onClose={() => setShowTransactionForm(false)}
        />
      )}

      {editingTransaction && (
        <TransactionForm
          categories={categories}
          transaction={editingTransaction}
          onSubmit={(data) => handleEditTransaction(editingTransaction.id, data)}
          onClose={() => setEditingTransaction(null)}
          isEditing={true}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onSubmit={handleAddCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal
          filters={filters}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;