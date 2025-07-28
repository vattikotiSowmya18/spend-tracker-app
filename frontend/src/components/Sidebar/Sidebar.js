import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, subWeeks, subMonths } from 'date-fns';
import './Sidebar.css';

const Sidebar = ({ categories, filters, onFilterChange, onDeleteCategory }) => {
  const [dateMode, setDateMode] = useState('custom'); // 'custom', 'weekly', 'monthly'
  const [currentPeriod, setCurrentPeriod] = useState(new Date());

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category_id: categoryId });
  };

  const handleDateModeChange = (mode) => {
    setDateMode(mode);
    setCurrentPeriod(new Date());
    
    if (mode === 'custom') {
      onFilterChange({ from_date: '', to_date: '' });
    } else {
      updatePeriodDates(new Date(), mode);
    }
  };

  const updatePeriodDates = (date, mode) => {
    let startDate, endDate;
    
    if (mode === 'weekly') {
      startDate = startOfWeek(date, { weekStartsOn: 1 }); // Monday
      endDate = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    } else if (mode === 'monthly') {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    }
    
    onFilterChange({
      from_date: format(startDate, 'yyyy-MM-dd'),
      to_date: format(endDate, 'yyyy-MM-dd')
    });
  };

  const navigatePeriod = (direction) => {
    let newPeriod;
    
    if (dateMode === 'weekly') {
      newPeriod = direction === 'prev' ? subWeeks(currentPeriod, 1) : addWeeks(currentPeriod, 1);
    } else if (dateMode === 'monthly') {
      newPeriod = direction === 'prev' ? subMonths(currentPeriod, 1) : addMonths(currentPeriod, 1);
    }
    
    setCurrentPeriod(newPeriod);
    updatePeriodDates(newPeriod, dateMode);
  };

  const formatPeriodLabel = () => {
    if (dateMode === 'weekly') {
      const start = startOfWeek(currentPeriod, { weekStartsOn: 1 });
      const end = endOfWeek(currentPeriod, { weekStartsOn: 1 });
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    } else if (dateMode === 'monthly') {
      return format(currentPeriod, 'MMMM yyyy');
    }
    return '';
  };

  const handleCustomDateChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-card card">
        <h3 className="sidebar-title">📂 Categories</h3>
        
        <div className="category-list">
          <div 
            className={`category-item ${filters.category_id === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            <span className="category-color" style={{ backgroundColor: '#6c757d' }}></span>
            <span className="category-name">All Categories</span>
          </div>
          
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-item ${filters.category_id === category.id.toString() ? 'active' : ''}`}
            >
              <div className="category-content" onClick={() => handleCategoryChange(category.id.toString())}>
                <span 
                  className="category-color" 
                  style={{ backgroundColor: category.color }}
                ></span>
                <span className="category-name">{category.name}</span>
              </div>
              <button 
                className="category-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(category.id);
                }}
                title="Delete category"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-card card">
        <h3 className="sidebar-title">📅 Date Filters</h3>
        
        <div className="date-mode-selector">
          <button 
            className={`date-mode-btn ${dateMode === 'custom' ? 'active' : ''}`}
            onClick={() => handleDateModeChange('custom')}
          >
            Custom
          </button>
          <button 
            className={`date-mode-btn ${dateMode === 'weekly' ? 'active' : ''}`}
            onClick={() => handleDateModeChange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`date-mode-btn ${dateMode === 'monthly' ? 'active' : ''}`}
            onClick={() => handleDateModeChange('monthly')}
          >
            Monthly
          </button>
        </div>

        {dateMode === 'custom' && (
          <div className="custom-date-filters">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.from_date}
                onChange={(e) => handleCustomDateChange('from_date', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.to_date}
                onChange={(e) => handleCustomDateChange('to_date', e.target.value)}
              />
            </div>
          </div>
        )}

        {(dateMode === 'weekly' || dateMode === 'monthly') && (
          <div className="period-navigator">
            <button 
              className="nav-btn"
              onClick={() => navigatePeriod('prev')}
              title={`Previous ${dateMode === 'weekly' ? 'week' : 'month'}`}
            >
              ⬅️
            </button>
            
            <div className="period-label">
              {formatPeriodLabel()}
            </div>
            
            <button 
              className="nav-btn"
              onClick={() => navigatePeriod('next')}
              title={`Next ${dateMode === 'weekly' ? 'week' : 'month'}`}
            >
              ➡️
            </button>
          </div>
        )}

        {(filters.from_date || filters.to_date || filters.category_id !== 'all') && (
          <button 
            className="clear-filters-btn btn btn-outline"
            onClick={() => {
              onFilterChange({ category_id: 'all', from_date: '', to_date: '' });
              setDateMode('custom');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;