import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

const Login = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  
  // Animation states
  const [visibleFields, setVisibleFields] = useState([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldCompleted, setFieldCompleted] = useState([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  
  const formFields = ['email', 'password'];
  const fieldRefs = useRef([]);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Initialize animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleFields([0]); // Start with first field
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Check when to show next field
  useEffect(() => {
    formFields.forEach((field, index) => {
      if (formData[field].trim().length > 0 && !fieldCompleted.includes(index)) {
        setFieldCompleted(prev => [...prev, index]);
        
        // Show next field with delay
        if (index < formFields.length - 1 && !visibleFields.includes(index + 1)) {
          setTimeout(() => {
            setVisibleFields(prev => [...prev, index + 1]);
            setCurrentFieldIndex(index + 1);
            
            // Auto-focus next field
            if (fieldRefs.current[index + 1]) {
              setTimeout(() => fieldRefs.current[index + 1].focus(), 100);
            }
          }, 400);
        }
      }
    });

    // Check if all fields are filled
    const allFilled = formFields.every(field => formData[field].trim().length > 0);
    if (allFilled && !isFormComplete) {
      setIsFormComplete(true);
    }
  }, [formData, fieldCompleted]);

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

  // Animation styles similar to Register component
  const getFieldStyle = (index) => {
    const isVisible = visibleFields.includes(index);
    const isActive = currentFieldIndex === index;
    const isCompleted = fieldCompleted.includes(index);
    
    return {
      width: '100%',
      maxWidth: '400px',
      border: 'none',
      borderBottom: `3px solid ${isActive ? '#3b82f6' : isCompleted ? '#10b981' : '#e5e7eb'}`,
      padding: '18px 10px',
      paddingRight: index >= 1 ? '50px' : '10px',
      marginBottom: '20px',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '17px',
      outline: 'none',
      backgroundColor: 'transparent',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      opacity: isVisible ? 1 : 0,
      animationDelay: `${index * 100}ms`,
      boxShadow: isActive ? '0 4px 20px rgba(59, 130, 246, 0.1)' : 'none',
    };
  };

  const getLabelStyle = (index) => {
    const isVisible = visibleFields.includes(index);
    const isCompleted = fieldCompleted.includes(index);
    
    return {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: isCompleted ? '#10b981' : '#6b7280',
      marginBottom: '6px',
      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      animationDelay: `${index * 100}ms`,
    };
  };

  const buttonStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '18px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '18px',
    marginTop: '10px',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
    transform: isFormComplete ? 'scale(1.02)' : 'scale(1)',
  };

  const buttonHoverStyle = {
    background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    transform: 'scale(1.05)',
    boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '50px 40px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: 'translateY(0)',
          animation: 'floatIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              marginBottom: '20px',
              animation: 'pulse 2s infinite',
            }}
          >
            <LogIn size={28} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Sign in to your account to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {error && (
            <div
              style={{
                color: '#ef4444',
                fontSize: '15px',
                marginBottom: '24px',
                textAlign: 'center',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                width: '100%',
                maxWidth: '400px',
                animation: 'shake 0.5s',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <label style={getLabelStyle(0)}>
                <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Email Address
              </label>
              <input
                ref={el => fieldRefs.current[0] = el}
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                style={getFieldStyle(0)}
                onFocus={() => setCurrentFieldIndex(0)}
              />
              {fieldCompleted.includes(0) && (
                <CheckCircle
                  size={20}
                  color="#10b981"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '42px',
                    animation: 'checkIn 0.4s',
                  }}
                />
              )}
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <label style={getLabelStyle(1)}>
                <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Password
              </label>
              <input
                ref={el => fieldRefs.current[1] = el}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                style={getFieldStyle(1)}
                onFocus={() => setCurrentFieldIndex(1)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: fieldCompleted.includes(1) ? '40px' : '12px',
                  top: '42px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
              </button>
              {fieldCompleted.includes(1) && (
                <CheckCircle
                  size={20}
                  color="#10b981"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '42px',
                    animation: 'checkIn 0.4s',
                  }}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormComplete}
            style={{
              ...buttonStyle,
              opacity: isFormComplete ? 1 : 0.6,
              cursor: isFormComplete && !loading ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if (isFormComplete && !loading) {
                Object.assign(e.currentTarget.style, buttonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              if (isFormComplete && !loading) {
                Object.assign(e.currentTarget.style, {
                  ...buttonStyle,
                  opacity: isFormComplete ? 1 : 0.6,
                });
              }
            }}
          >
            {loading ? (
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Sign up link section */}
          <div
            style={{
              marginTop: '30px',
              fontSize: '16px',
              textAlign: 'center',
              color: '#64748b',
              opacity: visibleFields.length === formFields.length ? 1 : 0,
              transition: 'opacity 0.5s',
              transitionDelay: '0.5s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <p style={{ margin: 0 }}>
              <span>Don't have an account? </span>
              <Link
                to="/register"
                style={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: '#3b82f6',
                  position: 'relative',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1e40af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#3b82f6';
                }}
              >
                Sign up
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: '#3b82f6',
                    transition: 'all 0.3s ease',
                  }}
                />
              </Link>
            </p>
          </div>

          {/* Debug Section (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              marginTop: '30px', 
              width: '100%',
              maxWidth: '400px',
              opacity: visibleFields.length === formFields.length ? 1 : 0,
              transition: 'opacity 0.5s',
              transitionDelay: '1s',
            }}>
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {showDebug ? 'Hide Debug Information' : 'Show Debug Information'}
              </button>
              
              {showDebug && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: '250px',
                  overflowY: 'auto',
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#1e40af',
                    marginBottom: '8px',
                    fontSize: '13px'
                  }}>
                    Debug Information:
                  </div>
                  <div style={{
                    color: '#475569',
                    fontSize: '11px',
                    lineHeight: '1.5'
                  }}>
                    {debugInfo || 'No debug information yet. Try logging in.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      <style>
        {`
          @keyframes floatIn {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              boxShadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            }
            50% {
              transform: scale(1.05);
              boxShadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes checkIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            70% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          input::placeholder {
            color: #9ca3af;
            transition: color 0.3s;
          }
          
          input:focus::placeholder {
            color: #d1d5db;
          }
          
          a:hover span {
            width: 100%;
          }
          
          /* Mobile responsiveness */
          @media (max-width: 480px) {
            div[style*="maxWidth: '480px'"] {
              padding: 30px 24px;
              border-radius: 20px;
            }
            
            h1[style*="fontSize: '32px'"] {
              font-size: 28px;
            }
            
            input[style*="fontSize: '17px'"] {
              font-size: 16px;
              padding: 16px 10px;
            }
            
            button[type="submit"] {
              font-size: 16px;
              padding: 16px;
            }
          }
          
          @media (max-width: 360px) {
            div[style*="maxWidth: '480px'"] {
              padding: 24px 20px;
            }
            
            h1[style*="fontSize: '32px'"] {
              font-size: 24px;
            }
            
            input[style*="fontSize: '17px'"] {
              font-size: 15px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;