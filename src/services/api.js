import axios from 'axios';

// Get base URL from environment variable with fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mordensafe.onrender.com';

// Enhanced debugging
console.log('🔧 API Configuration:');
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Full login endpoint:', `${API_BASE_URL}/api/auth/login`);
console.log('Full products endpoint:', `${API_BASE_URL}/api/products`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for Render.com
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Public endpoints that don't require token
const PUBLIC_ENDPOINTS = [
  '/api/auth/login', 
  '/api/auth/register',
  '/api/products'  // Products endpoint is also public
];

// Request interceptor
api.interceptors.request.use((config) => {
  // Enhanced request logging
  console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log('Request params:', config.params);
  console.log('Request data:', config.data);
  
  // Add Authorization header for protected endpoints
  if (!PUBLIC_ENDPOINTS.some(endpoint => config.url?.startsWith(endpoint))) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Added Authorization header');
    } else {
      console.log('⚠️ No token found for protected endpoint');
    }
  }
  
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Success] ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      dataSize: JSON.stringify(response.data)?.length,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ [API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Handle specific errors
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        console.log('🔒 Unauthorized - clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('🌐 Network Error - No response received');
    } else {
      // Something else happened
      console.error('⚠️ Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ------------------- AUTH API -------------------
export const authAPI = {
  login: (credentials) => {
    console.log('🔑 Login attempt with:', { email: credentials.email, password: '***' });
    return api.post('/api/auth/login', credentials);
  },
  register: (userData) => {
    console.log('📝 Register attempt:', { email: userData.email, name: userData.name });
    return api.post('/api/auth/register', userData);
  },
  getMe: () => {
    console.log('👤 Getting current user');
    return api.get('/api/auth/me');
  },
};

// ------------------- PRODUCTS API -------------------
export const productsAPI = {
  // Public products (available only)
  getProducts: (params = {}) => {
    const { category, available_only = true, page = 1, limit = 20, search } = params;
    console.log('🛒 Fetching products with params:', params);
    return api.get('/api/products', { 
      params: { 
        category: category !== 'all' ? category : undefined,
        available_only, 
        page, 
        limit,
        q: search // If backend supports search
      } 
    });
  },
  
  // Single product
  getProduct: (productId) => {
    console.log('📦 Fetching product:', productId);
    return api.get(`/api/products/${productId}`);
  },
  
  // Admin only
  getAllProductsAdmin: (params = {}) => {
    const { category, page = 1, limit = 20 } = params;
    return api.get('/api/admin/products', { params: { category, page, limit } });
  },
  
  createProduct: (formData) => {
    console.log('➕ Creating product');
    return api.post('/api/admin/products', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
  },
  
  updateProduct: (productId, formData) => {
    console.log('✏️ Updating product:', productId);
    return api.put(`/api/admin/products/${productId}`, formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
  },
  
  deleteProduct: (productId) => {
    console.log('🗑️ Deleting product:', productId);
    return api.delete(`/api/admin/products/${productId}`);
  },
};

// ------------------- REQUESTS API -------------------
export const requestsAPI = {
  createRequest: (requestData) => {
    console.log('📋 Creating service request');
    return api.post('/api/requests', requestData);
  },
  
  getMyRequests: () => {
    console.log('📄 Fetching user requests');
    return api.get('/api/requests/my-requests');
  },
  
  getAllRequests: () => {
    console.log('📋 Fetching all requests (admin)');
    return api.get('/api/requests');
  },
  
  updateRequest: (requestId, updateData) => {
    console.log('✏️ Updating request:', requestId);
    return api.put(`/api/requests/${requestId}`, updateData);
  },
  
  generateReceipt: (requestId) => {
    console.log('🧾 Generating receipt for request:', requestId);
    return api.get(`/api/requests/${requestId}/receipt`, {
      responseType: 'blob' // For PDF/download
    });
  },
};

// ------------------- NOTIFICATIONS API -------------------
export const notificationsAPI = {
  getNotifications: () => {
    console.log('🔔 Fetching notifications');
    return api.get('/api/notifications');
  },
  
  markAsRead: (notificationId) => {
    console.log('✓ Marking notification as read:', notificationId);
    return api.put(`/api/notifications/${notificationId}/read`);
  },
};

// ------------------- ADMIN API -------------------
export const adminAPI = {
  getStats: () => {
    console.log('📊 Fetching admin stats');
    return api.get('/api/admin/stats');
  },
  
  getUsers: () => {
    console.log('👥 Fetching users (admin)');
    return api.get('/api/admin/users');
  },
};

// ------------------- FILE UPLOAD HELPER -------------------
export const uploadFile = async (file, onProgress = null) => {
  console.log('📤 Uploading file:', file.name, file.type, file.size);
  
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📤 Upload progress: ${percentCompleted}%`);
        onProgress(percentCompleted);
      }
    },
  });
};

// ------------------- IMAGE URL HELPER -------------------
export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('🖼️ No image path provided');
    return 'https://via.placeholder.com/300x240?text=No+Image';
  }
  
  // If it's already a full URL
  if (imagePath.startsWith('http')) {
    console.log('🖼️ Using full URL:', imagePath);
    return imagePath;
  }
  
  // Handle relative paths
  if (imagePath.startsWith('/')) {
    const fullUrl = `${API_BASE_URL}${imagePath}`;
    console.log('🖼️ Constructed full URL:', fullUrl);
    return fullUrl;
  }
  
  // For other cases
  const fullUrl = `${API_BASE_URL}/${imagePath}`;
  console.log('🖼️ Constructed relative URL:', fullUrl);
  return fullUrl;
};

// ------------------- ERROR HANDLING -------------------
export const handleApiError = (error) => {
  console.error('🛠️ Handling API error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { 
          message: data.message || 'Bad request. Please check your input.', 
          status,
          details: data.detail || data
        };
      case 401:
        return { 
          message: 'Your session has expired. Please login again.', 
          status,
          autoLogout: true
        };
      case 403:
        return { 
          message: 'You do not have permission to perform this action.', 
          status 
        };
      case 404:
        return { 
          message: 'The requested resource was not found.', 
          status 
        };
      case 409:
        return { 
          message: data.message || 'This already exists. Please use a different value.', 
          status 
        };
      case 422:
        return { 
          message: 'Validation error. Please check your input.', 
          details: data.detail || data.errors,
          status 
        };
      case 500:
        return { 
          message: 'Server error. Our team has been notified. Please try again later.', 
          status 
        };
      default:
        return { 
          message: `Error ${status}: ${data.message || 'Something went wrong.'}`, 
          status 
        };
    }
  } else if (error.request) {
    return { 
      message: 'Network error. Please check your internet connection and try again.',
      status: 0,
      isNetworkError: true
    };
  } else {
    return { 
      message: error.message || 'An unexpected error occurred.', 
      status: -1 
    };
  }
};

// ------------------- API TEST FUNCTION -------------------
export const testApiConnection = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test 1: Check if server is reachable
    const serverTest = await fetch(API_BASE_URL, { method: 'HEAD' });
    console.log('Server reachable:', serverTest.ok);
    
    // Test 2: Check login endpoint
    const loginTest = await fetch(`${API_BASE_URL}/api/auth/login`, { 
      method: 'OPTIONS',
      mode: 'cors'
    });
    console.log('Login endpoint:', loginTest.status, loginTest.statusText);
    
    // Test 3: Check products endpoint
    const productsTest = await fetch(`${API_BASE_URL}/api/products`, { 
      method: 'GET',
      mode: 'cors'
    });
    console.log('Products endpoint:', productsTest.status, productsTest.statusText);
    
    return {
      server: serverTest.ok,
      loginEndpoint: loginTest.status,
      productsEndpoint: productsTest.status,
      apiBaseUrl: API_BASE_URL
    };
    
  } catch (error) {
    console.error('API Test failed:', error);
    return {
      error: error.message,
      apiBaseUrl: API_BASE_URL
    };
  }
};

// Export default api instance
export default api;