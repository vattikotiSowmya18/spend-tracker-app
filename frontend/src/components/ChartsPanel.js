import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';
import './ChartsPanel.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartsPanel = ({ filters, categories }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('pie'); // pie, bar, trends

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;

      const [categoryRes, trendsRes] = await Promise.all([
        analyticsAPI.getCategorySpending(params),
        analyticsAPI.getMonthlyTrends()
      ]);

      if (categoryRes.data.success) {
        setCategoryData(categoryRes.data.data);
      }

      if (trendsRes.data.success) {
        setMonthlyTrends(trendsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Prepare pie chart data
  const pieChartData = {
    labels: categoryData.map(item => item.category_name || 'Uncategorized'),
    datasets: [
      {
        label: 'Spending by Category',
        data: categoryData.map(item => item.total_spent),
        backgroundColor: categoryData.map(item => item.category_color || '#6c757d'),
        borderColor: categoryData.map(item => item.category_color || '#6c757d'),
        borderWidth: 2,
      },
    ],
  };

  // Prepare bar chart data
  const barChartData = {
    labels: categoryData.slice(0, 10).map(item => item.category_name || 'Uncategorized'),
    datasets: [
      {
        label: 'Total Spent',
        data: categoryData.slice(0, 10).map(item => item.total_spent),
        backgroundColor: 'rgba(255, 107, 107, 0.8)',
        borderColor: 'rgba(255, 107, 107, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Credited',
        data: categoryData.slice(0, 10).map(item => item.total_credited),
        backgroundColor: 'rgba(45, 183, 115, 0.8)',
        borderColor: 'rgba(45, 183, 115, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare monthly trends data
  const trendsChartData = {
    labels: monthlyTrends.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlyTrends.map(item => item.total_spent),
        backgroundColor: 'rgba(255, 107, 107, 0.8)',
        borderColor: 'rgba(255, 107, 107, 1)',
        borderWidth: 1,
      },
      {
        label: 'Monthly Income',
        data: monthlyTrends.map(item => item.total_credited),
        backgroundColor: 'rgba(45, 183, 115, 0.8)',
        borderColor: 'rgba(45, 183, 115, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="charts-panel">
        <div className="panel-header">
          <h3>📊 Analytics</h3>
        </div>
        <div className="charts-loading">
          <div className="loading-spinner"></div>
          <p>Loading charts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-panel">
      <div className="panel-header">
        <h3>📊 Analytics</h3>
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeChart === 'pie' ? 'active' : ''}`}
            onClick={() => setActiveChart('pie')}
          >
            🥧 Pie
          </button>
          <button 
            className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
            onClick={() => setActiveChart('bar')}
          >
            📊 Bar
          </button>
          <button 
            className={`chart-tab ${activeChart === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveChart('trends')}
          >
            📈 Trends
          </button>
        </div>
      </div>

      <div className="charts-content">
        {categoryData.length === 0 ? (
          <div className="empty-chart">
            <div className="empty-icon">📈</div>
            <h4>No data to display</h4>
            <p>Add some transactions to see analytics.</p>
          </div>
        ) : (
          <>
            {activeChart === 'pie' && (
              <div className="chart-container">
                <h4>Spending by Category</h4>
                <div className="chart-wrapper">
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              </div>
            )}

            {activeChart === 'bar' && (
              <div className="chart-container">
                <h4>Top Categories</h4>
                <div className="chart-wrapper">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            )}

            {activeChart === 'trends' && (
              <div className="chart-container">
                <h4>Monthly Trends</h4>
                <div className="chart-wrapper">
                  <Bar data={trendsChartData} options={barChartOptions} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        <div className="chart-stats">
          <h4>📋 Quick Stats</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Top Category</span>
              <span className="stat-value">
                {categoryData[0]?.category_name || 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Highest Spending</span>
              <span className="stat-value">
                {formatCurrency(categoryData[0]?.total_spent || 0)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Categories Used</span>
              <span className="stat-value">
                {categoryData.filter(item => item.total_spent > 0).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg per Category</span>
              <span className="stat-value">
                {categoryData.length > 0 
                  ? formatCurrency(categoryData.reduce((sum, item) => sum + item.total_spent, 0) / categoryData.length)
                  : formatCurrency(0)
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPanel;