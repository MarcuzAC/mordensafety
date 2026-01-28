import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AppContext = createContext();

const initialState = {
  user: null,
  cart: [],
  notifications: [],
  loading: true
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Verify token on app startup
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token with backend
          const response = await authAPI.getMe();
          dispatch({ type: 'SET_USER', payload: response.data });
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_USER', payload: null });
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    verifyToken();
  }, []);

  // Enhanced login function
  const login = async (userData) => {
    console.log('AppContext login called with:', userData);
    
    try {
      // Extract token and user from response data
      let token = null;
      let user = null;
      
      // Handle different response formats
      if (userData.access_token) {
        token = userData.access_token;
        user = userData.user || {};
      } else if (userData.token) {
        token = userData.token;
        user = userData.user || {};
      } else if (typeof userData === 'string') {
        token = userData;
        user = {};
      } else {
        // Assume userData contains token and user directly
        token = userData.token || userData.access_token;
        user = userData.user || userData;
      }
      
      if (!token) {
        console.error('No token found in login data:', userData);
        return false;
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // If we don't have complete user info, fetch it
      if (!user.id || !user.email) {
        try {
          const response = await authAPI.getMe();
          user = response.data;
        } catch (error) {
          console.warn('Could not fetch user details, using partial info:', error);
        }
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      return true;
      
    } catch (error) {
      console.error('Login failed in AppContext:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartTotal = state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = state.cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartItemsCount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};