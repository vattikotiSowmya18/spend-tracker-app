import React from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  categories, 
  filters, 
  onFilterChange, 
  onAddCategory, 
  onDeleteCategory,
  periodLabel,
  onPeriodNavigation,
  showNavigation
}) => {
  
  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category_id: categoryId });
  };

  const handlePeriodChange = (period) => {
    onFilterChange({ period });
  };

  const handleDateChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>📊 Time Period</h3>
        <div className="period-selector">
          <label>
            <input
              type="radio"
              name="period"
              value="all"
              checked={filters.period === 'all'}
              onChange={(e) => handlePeriodChange(e.target.value)}
            />
            All Time
          </label>
          <label>
            <input
              type="radio"
              name="period"
              value="week"
              checked={filters.period === 'week'}
              onChange={(e) => handlePeriodChange(e.target.value)}
            />
            Weekly
          </label>
          <label>
            <input
              type="radio"
              name="period"
              value="month"
              checked={filters.period === 'month'}
              onChange={(e) => handlePeriodChange(e.target.value)}
            />
            Monthly
          </label>
        </div>

        {showNavigation && (
          <div className="period-navigation">
            <button 
              className="nav-btn"
              onClick={() => onPeriodNavigation(-1)}
            >
              ← Previous
            </button>
            <span className="period-label">{periodLabel}</span>
            <button 
              className="nav-btn"
              onClick={() => onPeriodNavigation(1)}
            >
              Next →
            </button>
          </div>
        )}

        {filters.period === 'all' && (
          <div className="custom-date-range">
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={filters.from_date}
                onChange={(e) => handleDateChange('from_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={filters.to_date}
                onChange={(e) => handleDateChange('to_date', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>🏷️ Categories</h3>
          <button 
            className="btn btn-sm btn-primary"
            onClick={onAddCategory}
            title="Add Category"
          >
            ➕
          </button>
        </div>

        <div className="category-list">
          <div 
            className={`category-item ${filters.category_id === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            <span className="category-icon">📋</span>
            <span className="category-name">All Categories</span>
          </div>

          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-item ${filters.category_id === category.id.toString() ? 'active' : ''}`}
            >
              <div 
                className="category-main"
                onClick={() => handleCategoryChange(category.id.toString())}
              >
                <span 
                  className="category-color"
                  style={{ backgroundColor: category.color }}
                ></span>
                <span className="category-name">{category.name}</span>
              </div>
              {category.user_id && ( // Only show delete for user-created categories
                <button
                  className="category-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.id);
                  }}
                  title="Delete Category"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>ℹ️ Quick Stats</h3>
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Total Categories</span>
            <span className="stat-value">{categories.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Filter</span>
            <span className="stat-value">
              {filters.category_id === 'all' 
                ? 'All' 
                : categories.find(c => c.id.toString() === filters.category_id)?.name || 'Unknown'
              }
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;