import React, { useState, useEffect } from 'react';
import './TransactionModal.css';

const TransactionModal = ({ transaction, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    description: '',
    credited: '',
    debited: '',
    transaction_date: ''
  });
  const [transactionType, setTransactionType] = useState('debit'); // 'credit' or 'debit'
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      // Editing existing transaction
      setFormData({
        category_id: transaction.category_id || '',
        description: transaction.description || '',
        credited: transaction.credited > 0 ? transaction.credited.toString() : '',
        debited: transaction.debited > 0 ? transaction.debited.toString() : '',
        transaction_date: transaction.transaction_date || ''
      });
      setTransactionType(transaction.credited > 0 ? 'credit' : 'debit');
    } else {
      // Adding new transaction
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        category_id: '',
        description: '',
        credited: '',
        debited: '',
        transaction_date: today
      });
      setTransactionType('debit');
    }
  }, [transaction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTypeChange = (type) => {
    setTransactionType(type);
    // Clear amounts when switching type
    setFormData(prev => ({
      ...prev,
      credited: '',
      debited: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Please select a date';
    }

    const amount = transactionType === 'credit' ? formData.credited : formData.debited;
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const amount = parseFloat(transactionType === 'credit' ? formData.credited : formData.debited) || 0;
    
    const submitData = {
      category_id: parseInt(formData.category_id),
      description: formData.description.trim(),
      credited: transactionType === 'credit' ? amount : 0,
      debited: transactionType === 'debit' ? amount : 0,
      transaction_date: formData.transaction_date
    };

    onSubmit(submitData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            {transaction ? '✏️ Edit Transaction' : '➕ Add Transaction'}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleInputChange}
                className={`form-control ${errors.transaction_date ? 'error' : ''}`}
                required
              />
              {errors.transaction_date && (
                <div className="error-message">{errors.transaction_date}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className={`form-control form-select ${errors.category_id ? 'error' : ''}`}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <div className="error-message">{errors.category_id}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-control ${errors.description ? 'error' : ''}`}
              placeholder="Enter transaction description"
              required
            />
            {errors.description && (
              <div className="error-message">{errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Type *</label>
            <div className="transaction-type-selector">
              <button
                type="button"
                className={`type-btn ${transactionType === 'credit' ? 'active' : ''}`}
                onClick={() => handleTypeChange('credit')}
              >
                💰 Income
              </button>
              <button
                type="button"
                className={`type-btn ${transactionType === 'debit' ? 'active' : ''}`}
                onClick={() => handleTypeChange('debit')}
              >
                💸 Expense
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {transactionType === 'credit' ? 'Income Amount' : 'Expense Amount'} *
            </label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                name={transactionType === 'credit' ? 'credited' : 'debited'}
                value={transactionType === 'credit' ? formData.credited : formData.debited}
                onChange={handleInputChange}
                className={`form-control amount-input ${errors.amount ? 'error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            {errors.amount && (
              <div className="error-message">{errors.amount}</div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {transaction ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;