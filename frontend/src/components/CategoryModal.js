import React, { useState } from 'react';
import './CategoryModal.css';

const CategoryModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff',
    icon: 'category'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const predefinedColors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd',
    '#00d2d3', '#ff9ff3', '#2ed573', '#1e90ff', '#6c5ce7'
  ];

  const iconOptions = [
    'category', 'restaurant', 'car', 'shopping_bag', 'movie',
    'receipt', 'medical_services', 'school', 'attach_money',
    'savings', 'home', 'flight', 'fitness_center', 'pets',
    'sports', 'music', 'coffee', 'gas_station', 'phone'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (formData.name.length > 50) {
      newErrors.name = 'Category name must be 50 characters or less';
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
    
    try {
      await onSubmit(formData);
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
      <div className="modal-content category-modal">
        <div className="modal-header">
          <h2>🏷️ Add New Category</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Travel, Subscriptions"
              className={errors.name ? 'error' : ''}
              maxLength="50"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of this category"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="color-input"
              />
              <div className="predefined-colors">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon</label>
            <select
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
            >
              {iconOptions.map(icon => (
                <option key={icon} value={icon}>
                  {icon.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="category-preview">
            <h4>Preview</h4>
            <div className="preview-item">
              <span 
                className="preview-color"
                style={{ backgroundColor: formData.color }}
              ></span>
              <span className="preview-name">
                {formData.name || 'Category Name'}
              </span>
            </div>
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
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;