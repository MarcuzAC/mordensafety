import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const Login = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    // Check API status on component mount
    checkApiStatus();
  }, [user, navigate]);

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://mordensafe.onrender.com'}/api/auth/login`, {
        method: 'OPTIONS',
      });
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('error');
      }
    } catch (err) {
      setApiStatus('offline');
      console.error('API Status Check Failed:', err);
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
    
    // Trim and validate inputs
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
    
    console.log('=== LOGIN ATTEMPT STARTED ===');
    console.log('Email:', email);
    console.log('API URL:', process.env.REACT_APP_API_URL);
    
    try {
      const response = await authAPI.login({
        email: email,
        password: password
      });
      
      console.log('=== LOGIN API RESPONSE ===');
      console.log('Full Response:', response);
      console.log('Response Data:', response.data);
      console.log('Response Headers:', response.headers);
      
      setDebugInfo(`
        Status: ${response.status}
        Headers: ${JSON.stringify(response.headers, null, 2)}
        Data: ${JSON.stringify(response.data, null, 2)}
      `);
      
      // Pass response data to login function
      const loginSuccess = await login(response.data);
      
      if (loginSuccess) {
        console.log('Login successful, navigating to home');
        
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
        setError('Failed to process login credentials');
        console.error('Login function returned false');
      }
      
    } catch (err) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error Object:', err);
      console.error('Error Response:', err.response);
      console.error('Error Request:', err.request);
      console.error('Error Message:', err.message);
      console.error('Error Config:', err.config);
      
      let errorMessage = 'Login failed. Please try again.';
      let debugDetails = '';
      
      if (err.response) {
        // Server responded with error
        const { status, data } = err.response;
        debugDetails = `
          Status: ${status}
          Data: ${JSON.stringify(data, null, 2)}
          Headers: ${JSON.stringify(err.response.headers, null, 2)}
        `;
        
        if (status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (status === 400) {
          errorMessage = data?.detail || 'Bad request. Please check your input.';
        } else if (status === 404) {
          errorMessage = 'Login endpoint not found';
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
        // Request was made but no response
        errorMessage = 'Network error. Please check:';
        debugDetails = `
          1. Is the server running?
          2. Check browser console for CORS errors
          3. API URL: ${process.env.REACT_APP_API_URL}
          4. Try a different network
        `;
      } else {
        // Setup error
        errorMessage = err.message || 'Failed to send request';
      }
      
      setError(errorMessage);
      setDebugInfo(debugDetails);
      
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      setDebugInfo('Testing API connection...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://mordensafe.onrender.com'}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      const data = await response.text();
      setDebugInfo(`
        API Test Result:
        Status: ${response.status}
        Status Text: ${response.statusText}
        Headers: ${JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2)}
        Body: ${data}
      `);
      
    } catch (err) {
      setDebugInfo(`
        API Test Failed:
        Error: ${err.message}
        API URL: ${process.env.REACT_APP_API_URL || 'https://mordensafe.onrender.com'}
      `);
    }
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: '20px',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid #e2e8f0',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const subtitleStyle = {
    fontSize: '1rem',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: '1.5',
  };

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '24px',
  };

  const inputStyle = {
    width: '100%',
    padding: '18px 20px',
    paddingRight: '50px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    outline: 'none',
  };

  const inputFocusStyle = {
    borderColor: '#3b82f6',
    backgroundColor: 'white',
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonStyle = {
    width: '100%',
    padding: '18px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s ease',
    marginTop: '8px',
  };

  const buttonHoverStyle = {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
  };

  const linkStyle = {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  };

  const linkHoverStyle = {
    color: '#1e40af',
    textDecoration: 'underline',
  };

  const errorStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
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
    maxHeight: '300px',
    overflow: 'auto',
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
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* API Status Indicator */}
        <div style={apiStatusStyle}>
          {apiStatus === 'online' && <CheckCircle size={14} />}
          {apiStatus === 'offline' && <AlertCircle size={14} />}
          {apiStatus === 'checking' && <div style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
          API Status: {apiStatus === 'online' ? 'Online' : 
                      apiStatus === 'offline' ? 'Offline' : 
                      apiStatus === 'checking' ? 'Checking...' : 'Unknown'}
        </div>

        {/* Header */}
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>
          Sign in to your account to access premium fire safety equipment
        </p>

        {/* Error Display */}
        {error && (
          <div style={errorStyle}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {/* Password Input */}
          <div style={inputContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={labelStyle}>Password</label>
              <Link 
                to="/forgot-password" 
                style={linkStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={passwordToggleStyle}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || apiStatus === 'offline'}
            style={buttonStyle}
            onMouseEnter={(e) => !loading && apiStatus !== 'offline' && Object.assign(e.currentTarget.style, buttonHoverStyle)}
            onMouseLeave={(e) => !loading && apiStatus !== 'offline' && Object.assign(e.currentTarget.style, buttonStyle)}
          >
            {loading ? (
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid white',
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
        </form>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: '32px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={linkStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
          >
            Create Account
          </Link>
        </div>

        {/* Debug Section (Hidden by default) */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Debug Information</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </button>
              <button
                onClick={testApiConnection}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ExternalLink size={12} />
                Test API
              </button>
            </div>
          </div>
          
          {showDebug && (
            <div style={debugPanelStyle}>
              <div style={{ marginBottom: '8px', fontWeight: '600' }}>Environment Info:</div>
              <div>API URL: {process.env.REACT_APP_API_URL || 'Not set (using default)'}</div>
              <div>Node Env: {process.env.NODE_ENV}</div>
              <div style={{ marginTop: '12px', fontWeight: '600' }}>Debug Info:</div>
              <div>{debugInfo || 'No debug information yet. Try logging in or testing the API.'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          button:disabled:hover {
            transform: none !important;
            box-shadow: none !important;
          }
          
          input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          ::placeholder {
            color: #94a3b8;
          }
          
          /* Scrollbar styling for debug panel */
          pre::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          pre::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }
          
          pre::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          
          pre::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
    </div>
  );
};

export default Login;