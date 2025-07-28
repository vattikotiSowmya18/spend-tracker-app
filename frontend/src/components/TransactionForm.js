import React, { useState, useEffect } from 'react';
import './TransactionForm.css';

const TransactionForm = ({ 
  categories, 
  transaction, 
  onSubmit, 
  onClose, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    category_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    credited: '',
    debited: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction && isEditing) {
      setFormData({
        category_id: transaction.category_id || '',
        transaction_date: transaction.transaction_date || '',
        description: transaction.description || '',
        credited: transaction.credited || '',
        debited: transaction.debited || '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const credited = parseFloat(formData.credited) || 0;
    const debited = parseFloat(formData.debited) || 0;

    if (credited === 0 && debited === 0) {
      newErrors.amount = 'Either credited or debited amount must be greater than 0';
    }

    if (credited < 0) {
      newErrors.credited = 'Credited amount cannot be negative';
    }

    if (debited < 0) {
      newErrors.debited = 'Debited amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const submitData = {
      ...formData,
      credited: parseFloat(formData.credited) || 0,
      debited: parseFloat(formData.debited) || 0
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content transaction-form-modal">
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Edit Transaction' : '➕ Add New Transaction'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className={errors.category_id ? 'error' : ''}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="error-text">{errors.category_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="transaction_date">Date *</label>
              <input
                type="date"
                id="transaction_date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleInputChange}
                className={errors.transaction_date ? 'error' : ''}
              />
              {errors.transaction_date && <span className="error-text">{errors.transaction_date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Grocery shopping, Salary payment"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="credited">Credited Amount</label>
              <div className="amount-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="credited"
                  name="credited"
                  value={formData.credited}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={errors.credited ? 'error' : ''}
                />
              </div>
              {errors.credited && <span className="error-text">{errors.credited}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="debited">Debited Amount</label>
              <div className="amount-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  id="debited"
                  name="debited"
                  value={formData.debited}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={errors.debited ? 'error' : ''}
                />
              </div>
              {errors.debited && <span className="error-text">{errors.debited}</span>}
            </div>
          </div>

          {errors.amount && (
            <div className="error-message">{errors.amount}</div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about this transaction"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;