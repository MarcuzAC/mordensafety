import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

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

  // Responsive styles
  const containerStyle = {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Poppins', sans-serif",
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    padding: isMobile ? '20px 16px' : '20px',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: isMobile ? '100%' : '480px',
    padding: isMobile ? '30px 20px' : '40px 30px',
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: isMobile ? '30px' : '40px',
  };

  const logoStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? '60px' : '80px',
    height: isMobile ? '60px' : '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    marginBottom: isMobile ? '20px' : '30px',
    animation: 'pulse 2s infinite',
  };

  const titleStyle = {
    fontSize: isMobile ? '2rem' : '2.5rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const subtitleStyle = {
    fontSize: isMobile ? '1rem' : '1.1rem',
    color: '#64748b',
  };

  const inputContainerStyle = {
    width: '100%',
    marginBottom: isMobile ? '20px' : '24px',
    position: 'relative',
  };

  const inputGroupStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    border: 'none',
    borderBottom: '3px solid #e2e8f0',
    padding: isMobile ? '14px 10px 14px 45px' : '16px 10px 16px 50px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: isMobile ? '16px' : '18px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
  };

  const inputFocusStyle = {
    borderBottom: '3px solid #3b82f6',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
  };

  const iconStyle = {
    position: 'absolute',
    left: isMobile ? '12px' : '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    transition: 'color 0.3s ease',
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: isMobile ? '10px' : '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#94a3b8',
    transition: 'color 0.2s',
  };

  const buttonStyle = {
    width: '100%',
    padding: isMobile ? '16px' : '18px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '12px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: isMobile ? '16px' : '18px',
    marginTop: '10px',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
  };

  const buttonHoverStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: isMobile ? '14px' : '15px',
    marginBottom: isMobile ? '20px' : '24px',
    textAlign: 'center',
    width: '100%',
    padding: isMobile ? '12px 16px' : '14px 20px',
    backgroundColor: '#fef2f2',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    animation: 'shake 0.5s',
  };

  const linkContainerStyle = {
    marginTop: isMobile ? '20px' : '24px',
    fontSize: isMobile ? '16px' : '17px',
    textAlign: 'center',
    color: '#64748b',
  };

  const linkStyle = {
    fontWeight: 600,
    textDecoration: 'none',
    color: '#3b82f6',
    transition: 'color 0.2s',
    position: 'relative',
    paddingBottom: '2px',
  };

  const linkHoverStyle = {
    color: '#1e40af',
  };

  const debugButtonStyle = {
    width: '100%',
    padding: isMobile ? '10px' : '12px',
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: isMobile ? '12px' : '13px',
    color: '#64748b',
    cursor: 'pointer',
    marginTop: isMobile ? '20px' : '24px',
    transition: 'all 0.2s',
  };

  const debugPanelStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: isMobile ? '14px' : '16px',
    marginTop: '16px',
    fontSize: isMobile ? '11px' : '12px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '200px',
    overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      <div style={formStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoStyle}>
            <LogIn size={isMobile ? 28 : 32} color="#fff" />
          </div>
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>Sign in to your Morden Safety account</p>
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Email Input */}
          <div style={inputContainerStyle}>
            <div style={inputGroupStyle}>
              <Mail 
                size={isMobile ? 20 : 22} 
                style={iconStyle} 
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={inputContainerStyle}>
            <div style={inputGroupStyle}>
              <Lock 
                size={isMobile ? 20 : 22} 
                style={iconStyle} 
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                style={{ ...inputStyle, paddingRight: isMobile ? '45px' : '50px' }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={passwordToggleStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={isMobile ? 20 : 22} /> : <Eye size={isMobile ? 20 : 22} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && Object.assign(e.currentTarget.style, buttonHoverStyle)}
            onMouseLeave={(e) => !loading && Object.assign(e.currentTarget.style, buttonStyle)}
          >
            {loading ? (
              <div
                style={{
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            ) : (
              <>
                <LogIn size={isMobile ? 20 : 24} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={linkContainerStyle}>
          <span style={{ color: '#64748b' }}>Don't have an account yet? </span>
          <Link 
            to="/register" 
            style={linkStyle}
            onMouseEnter={(e) => Object.assign(e.target.style, linkHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
          >
            Sign up here
          </Link>
        </div>

        {/* Debug Section (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ width: '100%' }}>
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              style={debugButtonStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, { 
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1'
              })}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, debugButtonStyle)}
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            
            {showDebug && (
              <div style={debugPanelStyle}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#475569' }}>Debug Information:</div>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
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
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
              20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes floatIn {
              0% {
                opacity: 0;
                transform: translateY(20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
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
            
            /* Scrollbar styling for debug panel */
            div::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            
            div::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            
            div::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            
            /* Mobile specific improvements */
            @media (max-width: 768px) {
              input {
                font-size: 16px !important; /* Prevent zoom on iOS */
              }
              
              button {
                min-height: 44px; /* Minimum touch target */
              }
            }
            
            /* Animation for form */
            form {
              animation: floatIn 0.6s ease-out;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Login;