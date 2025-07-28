import React, { useState } from 'react';
import { transactionsAPI } from '../services/api';
import './ExportModal.css';

const ExportModal = ({ filters, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    ...filters
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (exportFilters.category_id !== 'all') params.category_id = exportFilters.category_id;
      if (exportFilters.from_date) params.from_date = exportFilters.from_date;
      if (exportFilters.to_date) params.to_date = exportFilters.to_date;

      const response = await transactionsAPI.exportCSV(params);
      
      if (response.data.success) {
        // Create and download CSV file
        const csvData = response.data.data.csv_data;
        const filename = response.data.data.filename;
        
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        onClose();
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
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
      <div className="modal-content export-modal">
        <div className="modal-header">
          <h2>📊 Export Transactions</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="export-content">
          <div className="export-info">
            <h3>Export Options</h3>
            <p>Export your transaction data to a CSV file that can be opened in Excel, Google Sheets, or any spreadsheet application.</p>
          </div>

          <div className="export-filters">
            <h4>Filter Options</h4>
            
            <div className="form-group">
              <label htmlFor="export_category">Category</label>
              <select
                id="export_category"
                name="category_id"
                value={exportFilters.category_id}
                onChange={handleInputChange}
              >
                <option value="all">All Categories</option>
                {/* Note: In a real app, you'd pass categories as props */}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="export_from_date">From Date</label>
                <input
                  type="date"
                  id="export_from_date"
                  name="from_date"
                  value={exportFilters.from_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="export_to_date">To Date</label>
                <input
                  type="date"
                  id="export_to_date"
                  name="to_date"
                  value={exportFilters.to_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="export-preview">
            <h4>What will be included:</h4>
            <ul>
              <li>📅 Transaction Date</li>
              <li>🏷️ Category</li>
              <li>📝 Description</li>
              <li>💰 Credited Amount</li>
              <li>💸 Debited Amount</li>
              <li>🏦 Running Balance</li>
              <li>📋 Notes</li>
            </ul>
          </div>

          <div className="export-features">
            <h4>Export Features:</h4>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Compatible with Excel & Google Sheets</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔢</span>
                <span>Properly formatted currency values</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>UTF-8 encoded for international characters</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Instant download</span>
              </div>
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner small"></span>
                Exporting...
              </>
            ) : (
              <>
                📥 Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;