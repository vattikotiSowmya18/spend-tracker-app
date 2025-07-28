import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token (future use)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login if needed
    }
    
    throw error.response?.data || error.message;
  }
);

export const apiService = {
  // Authentication (prepared for future use)
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Categories
  getCategories: async () => {
    return await api.get('/categories');
  },

  createCategory: async (categoryData) => {
    return await api.post('/categories', categoryData);
  },

  deleteCategory: async (categoryId) => {
    return await api.delete(`/categories/${categoryId}`);
  },

  // Transactions
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });

    return await api.get(`/transactions?${params.toString()}`);
  },

  createTransaction: async (transactionData) => {
    return await api.post('/transactions', transactionData);
  },

  updateTransaction: async (transactionId, transactionData) => {
    return await api.put(`/transactions/${transactionId}`, transactionData);
  },

  deleteTransaction: async (transactionId) => {
    return await api.delete(`/transactions/${transactionId}`);
  },

  // Summary
  getSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });

    return await api.get(`/summary?${params.toString()}`);
  },

  // Charts
  getCategorySpending: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });

    return await api.get(`/charts/category-spending?${params.toString()}`);
  },

  getMonthlyTrend: async () => {
    return await api.get('/charts/monthly-trend');
  },

  // Export
  exportTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });

    return await api.get(`/export/csv?${params.toString()}`);
  },

  // Health check
  healthCheck: async () => {
    return await api.get('/health');
  }
};

export default apiService;