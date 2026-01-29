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
  '/api/products',  // Products endpoint is also public
  '/api/upload'     // Upload endpoint
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
      // Don't redirect here, let the component handle it
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
        // Dispatch custom event for components to handle
        window.dispatchEvent(new Event('unauthorized'));
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
    console.log('📝 Register attempt:', { email: userData.email, name: userData.full_name });
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
  
  // Helper function to get full image URL
  getFullImageUrl: (imagePath) => {
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
  },
};

// ------------------- ORDERS API (CLIENT & ADMIN) -------------------
export const ordersAPI = {
  // Client: Checkout from cart
  checkout: (orderData) => {
    console.log('💳 Checkout order:', orderData);
    return api.post('/api/orders/checkout', orderData);
  },
  
  // Client: Get my orders
  getMyOrders: () => {
    console.log('📋 Getting user orders');
    return api.get('/api/orders/my-orders');
  },
  
  // Client/Admin: Get single order details
  getOrder: (orderId) => {
    console.log('📦 Getting order details:', orderId);
    return api.get(`/api/orders/${orderId}`);
  },
  
  // Admin: Get all orders with filters
  getAllOrders: (params = {}) => {
    const { status, start_date, end_date, page = 1, limit = 20 } = params;
    console.log('📊 Getting all orders with filters:', params);
    return api.get('/api/orders', {
      params: { status, start_date, end_date, page, limit }
    });
  },
  
  // Admin: Update order status
  updateOrderStatus: (orderId, statusData) => {
    console.log('🔄 Updating order status:', orderId, statusData);
    return api.put(`/api/orders/${orderId}/status`, statusData);
  },
  
  // Admin: Update payment status
  updatePaymentStatus: (orderId, paymentData) => {
    console.log('💰 Updating payment status:', orderId, paymentData);
    return api.put(`/api/orders/${orderId}/payment`, paymentData);
  },
  
  // Generate invoice for order
  generateInvoice: (orderId) => {
    console.log('🧾 Generating invoice for order:', orderId);
    return api.get(`/api/orders/${orderId}/invoice`, {
      responseType: 'blob' // For PDF/download
    });
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
  
  getAllRequests: (status) => {
    console.log('📋 Fetching all requests (admin)');
    return api.get('/api/requests', { params: { status } });
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
  
  // Update quote for service request (admin only)
  updateQuote: (requestId, quoteAmount) => {
    console.log('💰 Updating quote for request:', requestId, quoteAmount);
    return api.put(`/api/requests/${requestId}/quote`, { quote_amount: quoteAmount });
  },
  
  // Complete service payment (admin only)
  completeServicePayment: (requestId, paymentData) => {
    console.log('💳 Completing service payment:', requestId, paymentData);
    return api.put(`/api/requests/${requestId}/complete-payment`, paymentData);
  },
};

// ------------------- TRANSACTIONS API (ADMIN) -------------------
export const transactionsAPI = {
  // Get all transactions with filters
  getAllTransactions: (params = {}) => {
    const { type, start_date, end_date, page = 1, limit = 20 } = params;
    console.log('💸 Getting transactions with filters:', params);
    return api.get('/api/transactions', {
      params: { type, start_date, end_date, page, limit }
    });
  },
  
  // Get revenue summary for dashboard
  getRevenueSummary: (period = 'month') => {
    console.log('📈 Getting revenue summary for period:', period);
    return api.get('/api/transactions/revenue-summary', { params: { period } });
  },
};

// ------------------- EXPENSES API (ADMIN) -------------------
export const expensesAPI = {
  // Get all expenses with filters
  getAllExpenses: (params = {}) => {
    const { category, status, start_date, end_date, page = 1, limit = 20 } = params;
    console.log('📋 Getting expenses with filters:', params);
    return api.get('/api/expenses', {
      params: { category, status, start_date, end_date, page, limit }
    });
  },
  
  // Create new expense
  createExpense: (formData) => {
    console.log('➕ Creating expense');
    return api.post('/api/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update expense
  updateExpense: (expenseId, formData) => {
    console.log('✏️ Updating expense:', expenseId);
    return api.put(`/api/expenses/${expenseId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete expense
  deleteExpense: (expenseId) => {
    console.log('🗑️ Deleting expense:', expenseId);
    return api.delete(`/api/expenses/${expenseId}`);
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
  getStats: (params = {}) => {
    const { start_date, end_date } = params;
    console.log('📊 Fetching admin stats');
    return api.get('/api/admin/stats', { params: { start_date, end_date } });
  },
  
  getUsers: () => {
    console.log('👥 Fetching users (admin)');
    return api.get('/api/admin/users');
  },
  
  // Quick stats for dashboard
  getQuickStats: async () => {
    console.log('⚡ Getting quick stats for dashboard');
    try {
      const [stats, revenue] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/transactions/revenue-summary', { params: { period: 'month' } })
      ]);
      
      return {
        counts: stats.data.counts,
        financials: revenue.data,
        recentOrders: stats.data.recent_orders,
        recentRequests: stats.data.recent_requests,
        salesTrends: stats.data.sales_trends
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      throw error;
    }
  },
};

// ------------------- CART HELPER FUNCTIONS (Local Storage) -------------------
export const cartAPI = {
  // Get cart from localStorage
  getCart: () => {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },
  
  // Add item to cart
  addToCart: (product, quantity = 1) => {
    try {
      const cart = cartAPI.getCart();
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newQuantity = cart[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock_quantity) {
          throw new Error(`Only ${product.stock_quantity} items available in stock`);
        }
        cart[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        if (quantity > product.stock_quantity) {
          throw new Error(`Only ${product.stock_quantity} items available in stock`);
        }
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          images: product.images || [],
          stock_quantity: product.stock_quantity,
          description: product.description
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
  
  // Update item quantity in cart
  updateQuantity: (productId, quantity) => {
    try {
      const cart = cartAPI.getCart();
      const itemIndex = cart.findIndex(item => item.id === productId);
      
      if (itemIndex > -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          cart.splice(itemIndex, 1);
        } else if (quantity > cart[itemIndex].stock_quantity) {
          throw new Error(`Only ${cart[itemIndex].stock_quantity} items available in stock`);
        } else {
          // Update quantity
          cart[itemIndex].quantity = quantity;
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      return cart;
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  },
  
  // Remove item from cart
  removeFromCart: (productId) => {
    try {
      const cart = cartAPI.getCart();
      const filteredCart = cart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      window.dispatchEvent(new Event('cartUpdated'));
      return filteredCart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },
  
  // Clear entire cart
  clearCart: () => {
    try {
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      return [];
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
  
  // Get cart total amount
  getCartTotal: () => {
    try {
      const cart = cartAPI.getCart();
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  },
  
  // Get total number of items in cart
  getCartCount: () => {
    try {
      const cart = cartAPI.getCart();
      return cart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error calculating cart count:', error);
      return 0;
    }
  },
  
  // Check if product is in cart
  isInCart: (productId) => {
    try {
      const cart = cartAPI.getCart();
      return cart.some(item => item.id === productId);
    } catch (error) {
      console.error('Error checking if in cart:', error);
      return false;
    }
  },
  
  // Get item quantity from cart
  getItemQuantity: (productId) => {
    try {
      const cart = cartAPI.getCart();
      const item = cart.find(item => item.id === productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Error getting item quantity:', error);
      return 0;
    }
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
          message: data.detail || data.message || 'Bad request. Please check your input.', 
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
          message: `Error ${status}: ${data.detail || data.message || 'Something went wrong.'}`, 
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

// ------------------- EVENT DISPATCHER -------------------
// Helper to dispatch toast events
export const showToast = (message, type = 'info') => {
  const event = new CustomEvent('showToast', {
    detail: {
      message,
      type
    }
  });
  window.dispatchEvent(event);
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Helper to get current user
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper to get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// Export default api instance
export default api;