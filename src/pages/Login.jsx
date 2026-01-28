import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI, testApiConnection } from '../services/api';
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const Login = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
    checkApiStatus();
  }, [user, navigate]);

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      console.log('🔍 Checking API status...');
      
      const result = await testApiConnection();
      console.log('API Test Result:', result);
      
      if (result.error) {
        setApiStatus('offline');
        setDebugInfo(`Error: ${result.error}\nAPI URL: ${result.apiBaseUrl}`);
      } else if (result.loginEndpoint === 200 || result.loginEndpoint === 405) {
        setApiStatus('online');
      } else {
        setApiStatus('error');
        setDebugInfo(`Login endpoint status: ${result.loginEndpoint}\nProducts endpoint: ${result.productsEndpoint}`);
      }
    } catch (err) {
      console.error('API status check failed:', err);
      setApiStatus('offline');
      setDebugInfo(`Error: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setDebugInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');
    
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
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    
    try {
      const response = await authAPI.login({ email, password });
      console.log('✅ Login API Response:', response.data);
      
      setDebugInfo(`
        Status: ${response.status}
        Data keys: ${Object.keys(response.data).join(', ')}
        Response sample: ${JSON.stringify(response.data, null, 2).slice(0, 200)}...
      `);
      
      // Pass response data to login function
      const loginSuccess = await login(response.data);
      
      if (loginSuccess) {
        console.log('🎉 Login successful, navigating to home');
        
        // Show success message
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Successfully logged in!',
            type: 'success'
          }
        });
        window.dispatchEvent(event);
        
        // Redirect after a brief delay
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setError('Failed to process login credentials. Please try again.');
        console.error('❌ Login function returned false');
      }
      
    } catch (err) {
      console.error('❌ Login Error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      let debugDetails = '';
      
      if (err.response) {
        const { status, data } = err.response;
        debugDetails = `
          Status: ${status}
          Status Text: ${err.response.statusText}
          Data: ${JSON.stringify(data, null, 2)}
        `;
        
        if (status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 400) {
          errorMessage = data?.detail || 'Bad request. Please check your input.';
        } else if (status === 404) {
          errorMessage = 'Login endpoint not found. Please check API configuration.';
        } else if (status === 422) {
          errorMessage = 'Validation error. Please check your email format.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.detail) {
          errorMessage = data.detail;
        } else if (data?.message) {
          errorMessage = data.message;
        } else {
          errorMessage = `Login failed (Status: ${status})`;
        }
        
      } else if (err.request) {
        errorMessage = 'Network error. Please check:';
        debugDetails = `
          1. Is the server running?
          2. Check browser console for CORS errors
          3. Try refreshing the page
          4. Check your internet connection
        `;
      } else {
        errorMessage = err.message || 'Failed to send request';
        debugDetails = err.message;
      }
      
      setError(errorMessage);
      setDebugInfo(debugDetails);
      
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
                    apiStatus === 'checking' ? '#fef9c3' : 
                    apiStatus === 'error' ? '#ffedd5' : '#f3f4f6',
    color: apiStatus === 'online' ? '#166534' : 
           apiStatus === 'offline' ? '#dc2626' : 
           apiStatus === 'checking' ? '#92400e' : 
           apiStatus === 'error' ? '#9a3412' : '#4b5563',
  };

  const debugPanelStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '24px',
    fontSize: '12px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '200px',
    overflow: 'auto',
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
        <div style={apiStatusStyle}>
          {apiStatus === 'online' && <CheckCircle size={14} />}
          {apiStatus === 'offline' && <AlertCircle size={14} />}
          {apiStatus === 'checking' && <div style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          {apiStatus === 'error' && <AlertCircle size={14} />}
          
          {apiStatus === 'online' ? 'API Online' : 
           apiStatus === 'offline' ? 'API Offline' : 
           apiStatus === 'checking' ? 'Checking API...' : 
           apiStatus === 'error' ? 'API Error' : 'Unknown'}
          
          {(apiStatus === 'offline' || apiStatus === 'error') && (
            <button
              onClick={checkApiStatus}
              style={{
                marginLeft: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Retry API connection"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>

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
          disabled={loading || apiStatus === 'offline'}
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
            disabled={loading || apiStatus === 'offline'}
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
            disabled={loading || apiStatus === 'offline'}
          >
            {showPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || apiStatus === 'offline'}
          style={{
            ...buttonStyle,
            opacity: (loading || apiStatus === 'offline') ? 0.7 : 1,
            cursor: (loading || apiStatus === 'offline') ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => !loading && apiStatus !== 'offline' && Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseLeave={(e) => !loading && apiStatus !== 'offline' && Object.assign(e.currentTarget.style, buttonStyle)}
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
              <span>{apiStatus === 'offline' ? 'API Offline' : 'Sign In'}</span>
            </>
          )}
        </button>

        <div style={{ marginTop: '16px', fontSize: '16px', textAlign: 'center', color: '#3b82f6' }}>
          <Link 
            to="/register" 
            style={{ 
              textDecoration: 'none', 
              fontWeight: 600,
              opacity: apiStatus === 'offline' ? 0.5 : 1,
              pointerEvents: apiStatus === 'offline' ? 'none' : 'auto'
            }}
          >
            Sign up
          </Link>
        </div>

        {/* Debug Section (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '24px', width: '100%' }}>
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            
            {showDebug && (
              <div style={debugPanelStyle}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Debug Information:</div>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '11px' }}>
                  {debugInfo || 'No debug information yet. Try logging in.'}
                </div>
              </div>
            )}
          </div>
        )}

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
            
            a[disabled] {
              pointer-events: none;
              opacity: 0.5;
            }
            
            /* Scrollbar styling for debug panel */
            pre::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            
            pre::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            
            pre::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
          `}
        </style>
      </form>
    </div>
  );
};

export default Login;