import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');

  useEffect(() => {
    if (user) navigate('/');
    checkApiStatus();
  }, [user, navigate]);

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://mordensafe.onrender.com'}/api/auth/login`, {
        method: 'OPTIONS',
      });
      setApiStatus(response.ok ? 'online' : 'error');
    } catch (err) {
      setApiStatus('offline');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Trim and validate
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Login attempt with:', { email });
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      // Pass response data to login function
      const loginSuccess = await login(response.data);
      
      if (loginSuccess) {
        // Show success message
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Successfully logged in!',
            type: 'success'
          }
        });
        window.dispatchEvent(event);
        
        navigate('/');
      } else {
        setError('Failed to process login. Please try again.');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 401) {
          setError('Invalid email or password');
        } else if (status === 400) {
          setError(data?.detail || 'Bad request. Please check your input.');
        } else if (status === 404) {
          setError('Login endpoint not found');
        } else if (status === 422) {
          setError('Validation error. Please check your email format.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else if (data?.detail) {
          setError(data.detail);
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError(`Login failed (Status: ${status})`);
        }
        
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Your original styles
  const inputStyle = {
    width: '400px',
    border: 'none',
    borderBottom: '3px solid #3b82f6',
    padding: '16px 10px',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '18px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'transparent',
  };

  const inputFocusStyle = {
    borderBottom: '3px solid #1e40af',
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    fontSize: '18px',
  };

  const buttonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'scale(1.05)',
  };

  const apiStatusStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '24px',
    backgroundColor: apiStatus === 'online' ? '#dcfce7' : 
                    apiStatus === 'offline' ? '#fee2e2' : 
                    apiStatus === 'checking' ? '#fef9c3' : '#f3f4f6',
    color: apiStatus === 'online' ? '#166534' : 
           apiStatus === 'offline' ? '#dc2626' : 
           apiStatus === 'checking' ? '#92400e' : '#4b5563',
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        padding: '20px',
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* API Status Indicator */}
        {apiStatus !== 'online' && (
          <div style={apiStatusStyle}>
            {apiStatus === 'offline' && <AlertCircle size={14} />}
            {apiStatus === 'checking' && <div style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
            API Status: {apiStatus === 'online' ? 'Online' : 
                        apiStatus === 'offline' ? 'Offline' : 
                        apiStatus === 'checking' ? 'Checking...' : 'Unknown'}
          </div>
        )}

        {error && (
          <div
            style={{
              color: '#b91c1c',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center',
              maxWidth: '400px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          disabled={loading}
        />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{ ...inputStyle, paddingRight: '40px' }}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
            disabled={loading}
          >
            {showPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
          onMouseEnter={(e) => !loading && Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseLeave={(e) => !loading && Object.assign(e.currentTarget.style, buttonStyle)}
        >
          {loading ? (
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '4px solid #fff',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : (
            <>
              <LogIn size={20} />
              <span>Sign In</span>
            </>
          )}
        </button>

        <div style={{ marginTop: '16px', fontSize: '16px', textAlign: 'center', color: '#3b82f6' }}>
          <Link to="/register" style={{ textDecoration: 'none', fontWeight: 600 }}>
            Sign up
          </Link>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            button:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
            
            button:disabled:hover {
              transform: none !important;
            }
            
            input:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          `}
        </style>
      </form>
    </div>
  );
};

export default Login;