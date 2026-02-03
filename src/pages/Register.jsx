import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, UserPlus, ArrowRight, CheckCircle, LogIn } from 'lucide-react';

const Register = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Animation states
  const [visibleFields, setVisibleFields] = useState([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldCompleted, setFieldCompleted] = useState([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  
  const formFields = ['full_name', 'email', 'phone', 'password', 'confirmPassword'];
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation styles
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
      paddingRight: index >= 3 ? '50px' : '10px',
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
            <UserPlus size={28} color="#fff" />
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
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Join us today! Fill in your details below
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
            {/* Full Name */}
            <div style={{ position: 'relative' }}>
              <label style={getLabelStyle(0)}>Full Name</label>
              <input
                ref={el => fieldRefs.current[0] = el}
                type="text"
                name="full_name"
                placeholder="Enter your full name"
                required
                value={formData.full_name}
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

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <label style={getLabelStyle(1)}>Email Address</label>
              <input
                ref={el => fieldRefs.current[1] = el}
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                style={getFieldStyle(1)}
                onFocus={() => setCurrentFieldIndex(1)}
              />
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

            {/* Phone */}
            <div style={{ position: 'relative' }}>
              <label style={getLabelStyle(2)}>Phone Number</label>
              <input
                ref={el => fieldRefs.current[2] = el}
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                required
                value={formData.phone}
                onChange={handleChange}
                style={getFieldStyle(2)}
                onFocus={() => setCurrentFieldIndex(2)}
              />
              {fieldCompleted.includes(2) && (
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
              <label style={getLabelStyle(3)}>Password</label>
              <input
                ref={el => fieldRefs.current[3] = el}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                required
                value={formData.password}
                onChange={handleChange}
                style={getFieldStyle(3)}
                onFocus={() => setCurrentFieldIndex(3)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '42px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {showPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div style={{ position: 'relative' }}>
              <label style={getLabelStyle(4)}>Confirm Password</label>
              <input
                ref={el => fieldRefs.current[4] = el}
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                style={getFieldStyle(4)}
                onFocus={() => setCurrentFieldIndex(4)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '42px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {showConfirmPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
              </button>
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
                <span>Create Account</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Already have an account section */}
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
              <span>Already have an account? </span>
              <Link
                to="/login"
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
                Sign in
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
            
            {/* New: "Joined Already? click here to login" link */}
            <div
              style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid rgba(226, 232, 240, 0.5)',
                width: '100%',
                maxWidth: '300px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <LogIn size={18} color="#64748b" />
                <span style={{ fontSize: '15px' }}>
                  <span style={{ color: '#64748b' }}>Joined Already? </span>
                  <Link
                    to="/login"
                    style={{
                      fontWeight: 600,
                      textDecoration: 'underline',
                      textDecorationColor: '#3b82f6',
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '3px',
                      color: '#3b82f6',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1e40af';
                      e.currentTarget.style.textDecorationColor = '#1e40af';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                      e.currentTarget.style.textDecorationColor = '#3b82f6';
                    }}
                  >
                    click here to login
                  </Link>
                </span>
              </div>
            </div>
          </div>
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
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
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
        `}
      </style>
    </div>
  );
};

export default Register;