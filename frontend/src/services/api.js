import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  demoLogin: () => api.post('/auth/demo-login'),
};

// Categories API calls
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (categoryData) => api.post('/categories', categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Transactions API calls
export const transactionsAPI = {
  getAll: (params = {}) => api.get('/transactions', { params }),
  create: (transactionData) => api.post('/transactions', transactionData),
  update: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (params = {}) => api.get('/transactions/summary', { params }),
  exportCSV: (params = {}) => api.get('/export/csv', { params }),
};

// Analytics API calls
export const analyticsAPI = {
  getCategorySpending: (params = {}) => api.get('/analytics/category-spending', { params }),
  getMonthlyTrends: () => api.get('/analytics/monthly-trends'),
};

export default api;