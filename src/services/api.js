import axios from 'axios';

// Get base URL from environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Log environment for debugging (remove in production)
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Public endpoints that don't require token
const PUBLIC_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

// Request interceptor
api.interceptors.request.use((config) => {
  // Log request for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params);
  }
  
  if (!PUBLIC_ENDPOINTS.includes(config.url)) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.status, response.data);
    }
    return response;
  },
  (error) => {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ------------------- AUTH API -------------------
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

// ------------------- PRODUCTS API -------------------
export const productsAPI = {
  // Public products (available only)
  getProducts: (params = {}) => {
    const { category, available_only = true, page = 1, limit = 20 } = params;
    return api.get('/api/products', { params: { category, available_only, page, limit } });
  },
  // Single product
  getProduct: (productId) => api.get(`/api/products/${productId}`),
  // Admin only
  getAllProductsAdmin: (params = {}) => {
    const { category, page = 1, limit = 20 } = params;
    return api.get('/api/admin/products', { params: { category, page, limit } });
  },
  createProduct: (formData) =>
    api.post('/api/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (productId, formData) =>
    api.put(`/api/admin/products/${productId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (productId) => api.delete(`/api/admin/products/${productId}`),
};

// ------------------- REQUESTS API -------------------
export const requestsAPI = {
  createRequest: (requestData) => api.post('/api/requests', requestData),
  getMyRequests: () => api.get('/api/requests/my-requests'),
  getAllRequests: () => api.get('/api/requests'), // admin only
  updateRequest: (requestId, updateData) => api.put(`/api/requests/${requestId}`, updateData),
  generateReceipt: (requestId) => api.get(`/api/requests/${requestId}/receipt`),
};

// ------------------- NOTIFICATIONS API -------------------
export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
  markAsRead: (notificationId) => api.put(`/api/notifications/${notificationId}/read`),
};

// ------------------- ADMIN API -------------------
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'), // Add this endpoint in backend if missing
};

// ------------------- FILE UPLOAD HELPER -------------------
export const uploadFile = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

// ------------------- IMAGE URL HELPER -------------------
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  
  // If it's already a full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle relative paths
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // For other cases, assume it's a relative path from the API
  return `${API_BASE_URL}/${imagePath}`;
};

// ------------------- ERROR HANDLING -------------------
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.message || 'Bad request. Please check your input.', status };
      case 401:
        return { message: 'Unauthorized. Please login again.', status };
      case 403:
        return { message: 'Forbidden. You do not have permission.', status };
      case 404:
        return { message: 'Resource not found.', status };
      case 409:
        return { message: data.message || 'Conflict. Resource already exists.', status };
      case 422:
        return { message: 'Validation error. Please check your input.', details: data.detail, status };
      case 500:
        return { message: 'Server error. Please try again later.', status };
      default:
        return { message: `Error ${status}: ${data.message || 'Unknown error'}`, status };
    }
  } else if (error.request) {
    // The request was made but no response was received
    return { message: 'Network error. Please check your connection.', status: 0 };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { message: error.message || 'Unknown error occurred.', status: -1 };
  }
};

// Export default api instance
export default api;