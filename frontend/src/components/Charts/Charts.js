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
import { apiService } from '../../services/apiService';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Charts = ({ filters }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('pie'); // 'pie' or 'monthly'

  useEffect(() => {
    loadChartsData();
  }, [filters]);

  const loadChartsData = async () => {
    try {
      setLoading(true);
      const [categoryResponse, monthlyResponse] = await Promise.all([
        apiService.getCategorySpending(filters),
        apiService.getMonthlyTrend()
      ]);

      if (categoryResponse.success) {
        setCategoryData(categoryResponse.data);
      }

      if (monthlyResponse.success) {
        setMonthlyData(monthlyResponse.data);
      }
    } catch (error) {
      console.error('Error loading charts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Pie Chart Configuration
  const pieChartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        label: 'Spending by Category',
        data: categoryData.map(item => item.amount),
        backgroundColor: categoryData.map(item => item.color),
        borderColor: categoryData.map(item => item.color),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#333',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500'
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      }
    },
  };

  // Monthly Trend Chart Configuration
  const monthlyChartData = {
    labels: monthlyData.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
    }),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(item => item.credited),
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(item => item.debited),
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 2,
      },
      {
        label: 'Net',
        data: monthlyData.map(item => item.net),
        backgroundColor: monthlyData.map(item => 
          item.net >= 0 ? 'rgba(23, 162, 184, 0.8)' : 'rgba(255, 193, 7, 0.8)'
        ),
        borderColor: monthlyData.map(item => 
          item.net >= 0 ? 'rgba(23, 162, 184, 1)' : 'rgba(255, 193, 7, 1)'
        ),
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500'
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
          font: {
            size: 11
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="charts-container card">
        <div className="charts-header">
          <h3 className="charts-title">📊 Analytics</h3>
        </div>
        <div className="charts-loading">
          <div className="loading-spinner"></div>
          <p>Loading charts...</p>
        </div>
      </div>
    );
  }

  if (categoryData.length === 0 && monthlyData.length === 0) {
    return (
      <div className="charts-container card">
        <div className="charts-header">
          <h3 className="charts-title">📊 Analytics</h3>
        </div>
        <div className="charts-empty">
          <div className="empty-icon">📈</div>
          <h4>No data available</h4>
          <p>Add some transactions to see your spending analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container card">
      <div className="charts-header">
        <h3 className="charts-title">📊 Analytics</h3>
        
        <div className="chart-tabs">
          <button 
            className={`chart-tab ${activeChart === 'pie' ? 'active' : ''}`}
            onClick={() => setActiveChart('pie')}
          >
            🥧 Categories
          </button>
          <button 
            className={`chart-tab ${activeChart === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveChart('monthly')}
          >
            📈 Trends
          </button>
        </div>
      </div>

      <div className="charts-content">
        {activeChart === 'pie' && categoryData.length > 0 && (
          <div className="chart-wrapper">
            <div className="chart-container">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="chart-summary">
              <h4>Category Breakdown</h4>
              <div className="category-stats">
                {categoryData.slice(0, 5).map((item, index) => (
                  <div key={index} className="category-stat">
                    <span 
                      className="stat-color"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="stat-name">{item.category}</span>
                    <span className="stat-amount">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {categoryData.length > 5 && (
                  <div className="category-stat others">
                    <span className="stat-color others-color"></span>
                    <span className="stat-name">Others ({categoryData.length - 5})</span>
                    <span className="stat-amount">
                      {formatCurrency(
                        categoryData.slice(5).reduce((sum, item) => sum + item.amount, 0)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeChart === 'monthly' && monthlyData.length > 0 && (
          <div className="chart-wrapper">
            <div className="chart-container">
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            </div>
            <div className="chart-summary">
              <h4>Monthly Summary</h4>
              <div className="monthly-stats">
                {monthlyData.slice(-6).map((item, index) => {
                  const [year, month] = item.month.split('-');
                  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: '2-digit' 
                  });
                  
                  return (
                    <div key={index} className="monthly-stat">
                      <div className="stat-month">{monthName}</div>
                      <div className="stat-values">
                        <div className="stat-income">+{formatCurrency(item.credited)}</div>
                        <div className="stat-expense">-{formatCurrency(item.debited)}</div>
                        <div className={`stat-net ${item.net >= 0 ? 'positive' : 'negative'}`}>
                          {item.net >= 0 ? '+' : ''}{formatCurrency(item.net)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;