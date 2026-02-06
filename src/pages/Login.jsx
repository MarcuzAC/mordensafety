import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI, productsAPI, getFullImageUrl } from '../services/api';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png'; // Import the logo

const Login = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  
  // Slideshow states
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideInterval = useRef(null);
  const [isLoadingSlides, setIsLoadingSlides] = useState(true);
  
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

  // Fetch product images for slideshow background
  useEffect(() => {
    fetchSlideshowProducts();
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const fetchSlideshowProducts = async () => {
    try {
      setIsLoadingSlides(true);
      const response = await productsAPI.getProducts({
        available_only: true,
        limit: 5 // Get max 5 products for slideshow
      });
      
      const products = response.data.products || [];
      
      // Filter products with images and create slides
      const slidesData = products
        .filter(product => product.images && product.images.length > 0)
        .map(product => ({
          url: getFullImageUrl(product.images[0]),
          title: product.name,
          description: product.description || 'Premium safety equipment',
          productId: product.id
        }));
      
      setSlides(slidesData);
      
    } catch (error) {
      console.error('Error fetching slideshow products:', error);
      // Use fallback slides if API fails
      setSlides([
        { url: 'https://images.unsplash.com/photo-1562155954-88dc7c9866ee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', title: 'Fire Safety', description: 'Premium safety equipment' },
        { url: 'https://images.unsplash.com/photo-1582732907851-725ed4a3b0f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', title: 'Safety Gear', description: 'Professional equipment' },
        { url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80', title: 'Industrial Safety', description: 'High-quality protection' }
      ]);
    } finally {
      setIsLoadingSlides(false);
    }
  };

  useEffect(() => {
    if (slides.length > 1) {
      startSlideshow();
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [slides]);

  const startSlideshow = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
    
    // Only start slideshow if we have more than 1 slide
    if (slides.length > 1) {
      slideInterval.current = setInterval(() => {
        goToNextSlide();
      }, 8000); // 8 seconds delay
    }
  };

  const goToNextSlide = () => {
    if (slides.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 800);
  };

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
      color: '#1e293b',
    };
  };

  const getLabelStyle = (index) => {
    const isVisible = visibleFields.includes(index);
    const isCompleted = fieldCompleted.includes(index);
    
    return {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: isCompleted ? '#10b981' : '#ffffff',
      marginBottom: '6px',
      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      animationDelay: `${index * 100}ms`,
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
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

  // Slideshow styles
  const slideStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#0f172a',
    transform: 'translateX(100%)',
    opacity: 0,
    transition: 'all 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
    filter: 'brightness(0.8) saturate(1.3)',
  };

  const activeSlideStyle = {
    ...slideStyle,
    transform: 'translateX(0)',
    opacity: 1,
  };

  const exitingSlideStyle = {
    ...slideStyle,
    transform: 'translateX(-100%)',
    opacity: 0.5,
  };

  // Static background for when no slides are available
  const staticBackgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    zIndex: 1,
  };

  const darkOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)',
    zIndex: 2,
  };

  if (isLoadingSlides) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        zIndex: 100,
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '5px solid #e2e8f0',
          borderTop: '5px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1.5s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Static background (shows when no slides available) */}
      <div style={staticBackgroundStyle} />

      {/* Slideshow Background */}
      {slides.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          {slides.map((slide, index) => {
            let style = slideStyle;
            
            if (index === currentSlide) {
              style = activeSlideStyle;
            } else if (
              index === (currentSlide - 1 + slides.length) % slides.length && 
              isTransitioning
            ) {
              style = exitingSlideStyle;
            }
            
            return (
              <div
                key={index}
                style={{
                  ...style,
                  backgroundImage: `url(${slide.url})`,
                }}
                onError={(e) => {
                  // Handle broken images gracefully
                  e.target.style.display = 'none';
                }}
              />
            );
          })}
          
          {/* Dark overlay for better text visibility */}
          <div style={darkOverlayStyle} />
        </div>
      )}

      {/* Login Form Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '50px 40px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: 'translateY(0)',
          animation: 'floatIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Logo/Header - UPDATED with logo in the icon container */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90px', // Slightly larger to accommodate logo
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(30, 64, 175, 0.8) 100%)',
                marginBottom: '20px',
                animation: 'pulse 2s infinite',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden', // To contain the logo
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 0 8px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Logo image with fallback */}
              <img 
                src={logo} 
                alt="Modern Safety Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '10px', // Add some padding so logo doesn't touch edges
                }}
                onError={(e) => {
                  // Fallback if logo doesn't load - show the LogIn icon
                  e.target.style.display = 'none';
                  const container = e.target.parentElement;
                  
                  // Create and add fallback icon
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.style.width = '100%';
                  fallbackIcon.style.height = '100%';
                  fallbackIcon.style.display = 'flex';
                  fallbackIcon.style.alignItems = 'center';
                  fallbackIcon.style.justifyContent = 'center';
                  
                  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  iconSvg.setAttribute('width', '32');
                  iconSvg.setAttribute('height', '32');
                  iconSvg.setAttribute('viewBox', '0 0 24 24');
                  iconSvg.setAttribute('fill', 'none');
                  iconSvg.setAttribute('stroke', 'white');
                  iconSvg.setAttribute('stroke-width', '2');
                  iconSvg.setAttribute('stroke-linecap', 'round');
                  iconSvg.setAttribute('stroke-linejoin', 'round');
                  
                  // Create path for LogIn icon
                  const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  path1.setAttribute('d', 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4');
                  
                  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                  polyline.setAttribute('points', '10 17 15 12 10 7');
                  
                  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                  line.setAttribute('x1', '15');
                  line.setAttribute('y1', '12');
                  line.setAttribute('x2', '3');
                  line.setAttribute('y2', '12');
                  
                  iconSvg.appendChild(path1);
                  iconSvg.appendChild(polyline);
                  iconSvg.appendChild(line);
                  
                  fallbackIcon.appendChild(iconSvg);
                  container.appendChild(fallbackIcon);
                }}
              />
              
              {/* Key overlay to indicate login */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '28px',
                height: '28px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                animation: 'pulse 1.5s infinite',
              }}>
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </Link>

          <h1 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
            letterSpacing: '-0.5px',
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '16px',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          }}>
            Sign in to your Modern Safety account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {error && (
            <div
              style={{
                color: '#fff',
                fontSize: '15px',
                marginBottom: '24px',
                textAlign: 'center',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.3)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                width: '100%',
                maxWidth: '400px',
                animation: 'shake 0.5s',
                backdropFilter: 'blur(10px)',
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
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
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
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
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
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
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
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
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
                  backdropFilter: 'blur(10px)',
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
              color: 'rgba(255, 255, 255, 0.9)',
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
              <span style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                Don't have an account?{' '}
              </span>
              <Link
                to="/register"
                style={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: '#60a5fa',
                  position: 'relative',
                  padding: '4px 0',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#93c5fd';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#60a5fa';
                  e.currentTarget.style.transform = 'translateY(0)';
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
                    background: '#60a5fa',
                    transition: 'all 0.3s ease',
                    transform: 'scaleX(0)',
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
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {showDebug ? 'Hide Debug Information' : 'Show Debug Information'}
              </button>
              
              {showDebug && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: '#60a5fa',
                    marginBottom: '8px',
                    fontSize: '13px'
                  }}>
                    Debug Information:
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
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
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
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
            color: rgba(255, 255, 255, 0.7);
            transition: color 0.3s;
          }
          
          input:focus::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          
          input {
            color: #fff;
            background: transparent;
          }
          
          input:focus {
            color: #fff;
          }
          
          a:hover span {
            transform: scaleX(1);
          }
          
          /* Mobile responsiveness */
          @media (max-width: 480px) {
            div[style*="maxWidth: '480px'"] {
              padding: 30px 24px;
              border-radius: 20px;
            }
            
            h1[style*="fontSize: '36px'"] {
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
            
            .logo-icon {
              width: 70px !important;
              height: 70px !important;
            }
            
            .logo-icon .key-badge {
              width: 22px !important;
              height: 22px !important;
            }
          }
          
          @media (max-width: 360px) {
            div[style*="maxWidth: '480px'"] {
              padding: 24px 20px;
            }
            
            h1[style*="fontSize: '36px'"] {
              font-size: 24px;
            }
            
            input[style*="fontSize: '17px'"] {
              fontSize: 15px;
            }
            
            .logo-icon {
              width: 60px !important;
              height: 60px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;