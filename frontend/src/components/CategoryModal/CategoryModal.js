import React, { useState } from 'react';
import './CategoryModal.css';

const CategoryModal = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#667eea'
  });
  const [errors, setErrors] = useState({});

  const colorOptions = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#ff9a9e', '#fecfef', '#fbc2eb', '#a6c1ee'
  ];

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

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter a category name';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      color: formData.color
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
      <div className="modal-container category-modal">
        <div className="modal-header">
          <h3 className="modal-title">📁 Add New Category</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="Enter category name (e.g., Food & Dining)"
              maxLength="50"
              required
            />
            {errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
            <div className="character-count">
              {formData.name.length}/50 characters
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category Color</label>
            <div className="color-grid">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={`Select ${color}`}
                >
                  {formData.color === color && (
                    <span className="color-check">✓</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="custom-color-input">
              <label className="custom-color-label">
                Or choose custom color:
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="custom-color-picker"
                />
              </label>
            </div>
          </div>

          <div className="category-preview">
            <div className="preview-label">Preview:</div>
            <div className="category-preview-item">
              <span 
                className="category-color-dot"
                style={{ backgroundColor: formData.color }}
              ></span>
              <span className="category-preview-name">
                {formData.name || 'Category Name'}
              </span>
            </div>
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
              disabled={!formData.name.trim()}
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;