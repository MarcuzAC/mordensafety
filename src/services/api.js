import axios from 'axios';

const API_BASE_URL = 'https://mordensafe.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Public endpoints that don't require token
const PUBLIC_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

// Request interceptor
api.interceptors.request.use((config) => {
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
  (response) => response,
  (error) => {
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

// Export default api instance
export default api;
