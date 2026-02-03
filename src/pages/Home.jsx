import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Truck, Users, Award, ChevronRight, Sun, Moon } from 'lucide-react';
import { productsAPI, getFullImageUrl } from '../services/api';

const Home = () => {
  const { user } = useApp();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const slideInterval = useRef(null);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Fetch product images for slideshow
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
      setIsLoading(true);
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
      // Don't set any slides if API fails - will show loading state
      setSlides([]);
    } finally {
      setIsLoading(false);
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
      }, 10000); // 10 seconds delay
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

  const goToPrevSlide = () => {
    if (slides.length <= 1) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 800);
  };

  const goToSlide = (index) => {
    if (slides.length <= 1 || index === currentSlide) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 800);
  };

  const features = [
    {
      icon: <Shield size={48} color="#3b82f6" />,
      title: 'Premium Safety Equipment',
      description: 'High-quality fire extinguishers and safety gear from trusted brands',
    },
    {
      icon: <Truck size={48} color="#3b82f6" />,
      title: 'Quick Delivery',
      description: 'Fast and reliable delivery across the country',
    },
    {
      icon: <Users size={48} color="#3b82f6" />,
      title: 'Expert Support',
      description: 'Professional guidance and after-sales service',
    },
    {
      icon: <Award size={48} color="#3b82f6" />,
      title: 'Quality Guaranteed',
      description: 'All products meet international safety standards',
    },
  ];

  const buttonStyle = {
    fontFamily: "'Poppins', sans-serif",
    padding: '12px 28px',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const cardStyle = {
    backgroundColor: isDarkTheme ? '#ffffff' : '#f8fafc',
    borderRadius: '16px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    border: '1px solid rgba(59, 130, 246, 0.1)',
  };

  // Main container
  const mainContainerStyle = {
    position: 'relative',
    width: '100%',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
  };

  // Loading state
  const loadingStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
    zIndex: 100,
  };

  // Hero section
  const heroSectionStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 20,
  };

  // Theme Toggle Button
  const themeToggleStyle = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)',
    border: `2px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
    color: isDarkTheme ? '#ffffff' : '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  };

  // Slideshow container - only show if we have slides
  const slideshowContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    zIndex: 1,
    display: slides.length > 0 ? 'block' : 'none',
  };

  // Static background for when no slides are available
  const staticBackgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    zIndex: 1,
  };

  // Individual slide
  const slideStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: isDarkTheme ? '#0f172a' : '#f8fafc',
    transform: 'translateX(100%)',
    opacity: 0,
    transition: 'all 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
    filter: isDarkTheme ? 'brightness(0.8) saturate(1.3)' : 'brightness(1) saturate(1.1)',
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

  // Enhanced dark overlay with gradient for better text visibility
  const darkOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: isDarkTheme 
      ? 'linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.4) 100%)'
      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.5) 100%)',
    zIndex: 2,
  };

  const leftOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '60%',
    height: '100%',
    background: isDarkTheme 
      ? 'linear-gradient(90deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 100%)'
      : 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%)',
    zIndex: 3,
    display: window.innerWidth > 768 ? 'block' : 'none', // Hide on mobile
  };

  const heroTitleStyle = {
    fontSize: 'clamp(2rem, 5vw, 4.5rem)',
    fontWeight: 900,
    color: isDarkTheme ? 'white' : '#1e293b',
    marginBottom: '24px',
    textShadow: isDarkTheme ? '0 8px 24px rgba(0, 0, 0, 0.8)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    lineHeight: 1.1,
    maxWidth: '900px',
    letterSpacing: '-0.025em',
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)'
      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const heroSubtitleStyle = {
    fontSize: 'clamp(1rem, 2vw, 1.8rem)',
    color: isDarkTheme ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.9)',
    marginBottom: '48px',
    textShadow: isDarkTheme ? '0 4px 12px rgba(0, 0, 0, 0.6)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    lineHeight: 1.7,
    fontWeight: 400,
    backdropFilter: 'blur(4px)',
    padding: '20px',
    borderRadius: '20px',
    background: isDarkTheme
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.03) 0%, rgba(59, 130, 246, 0.02) 100%)',
    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`,
  };

  const accentTextStyle = {
    color: isDarkTheme ? '#60a5fa' : '#3b82f6',
    fontWeight: 900,
    textShadow: isDarkTheme 
      ? '0 4px 20px rgba(96, 165, 250, 0.5)'
      : '0 2px 10px rgba(59, 130, 246, 0.3)',
    display: 'inline-block',
  };

  const heroButtonsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    marginTop: '40px',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDarkTheme ? '#3b82f6' : '#1e40af',
    color: 'white',
    padding: 'clamp(16px, 2vw, 20px) clamp(32px, 4vw, 48px)',
    fontSize: 'clamp(16px, 1.5vw, 18px)',
    fontWeight: 700,
    boxShadow: isDarkTheme 
      ? '0 10px 30px rgba(59, 130, 246, 0.4)'
      : '0 10px 30px rgba(30, 64, 175, 0.3)',
    border: `2px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'}`,
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const primaryButtonHoverStyle = {
    backgroundColor: isDarkTheme ? '#2563eb' : '#1e3a8a',
    transform: 'translateY(-5px) scale(1.05)',
    boxShadow: isDarkTheme 
      ? '0 20px 40px rgba(59, 130, 246, 0.6)'
      : '0 20px 40px rgba(30, 64, 175, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: isDarkTheme 
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(59, 130, 246, 0.15)',
    color: isDarkTheme ? 'white' : '#1e40af',
    padding: 'clamp(16px, 2vw, 20px) clamp(32px, 4vw, 48px)',
    fontSize: 'clamp(16px, 1.5vw, 18px)',
    fontWeight: 700,
    border: `2px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const secondaryButtonHoverStyle = {
    backgroundColor: isDarkTheme 
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(59, 130, 246, 0.25)',
    transform: 'translateY(-5px) scale(1.05)',
    borderColor: isDarkTheme 
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(59, 130, 246, 0.5)',
    boxShadow: isDarkTheme 
      ? '0 20px 40px rgba(255, 255, 255, 0.2)'
      : '0 20px 40px rgba(59, 130, 246, 0.2)',
  };

  // Navigation buttons - only show if we have multiple slides
  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: isDarkTheme 
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(59, 130, 246, 0.1)',
    border: `2px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
    color: isDarkTheme ? 'white' : '#3b82f6',
    width: 'clamp(50px, 5vw, 60px)',
    height: 'clamp(50px, 5vw, 60px)',
    borderRadius: '50%',
    cursor: 'pointer',
    display: slides.length > 1 ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    zIndex: 30,
    fontSize: 'clamp(20px, 2vw, 24px)',
  };

  const navButtonHoverStyle = {
    backgroundColor: isDarkTheme 
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(59, 130, 246, 0.2)',
    borderColor: isDarkTheme 
      ? 'rgba(255, 255, 255, 0.5)'
      : 'rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-50%) scale(1.1)',
  };

  // Slide indicators - only show if we have multiple slides
  const indicatorsContainerStyle = {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: slides.length > 1 ? 'flex' : 'none',
    gap: '12px',
    zIndex: 30,
  };

  const indicatorStyle = (active) => ({
    width: active ? '40px' : '12px',
    height: '12px',
    borderRadius: '6px',
    backgroundColor: active 
      ? (isDarkTheme ? '#3b82f6' : '#1e40af')
      : (isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(30, 64, 175, 0.3)'),
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: active 
      ? 'none' 
      : `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
    boxShadow: active 
      ? `0 0 20px ${isDarkTheme ? 'rgba(59, 130, 246, 0.5)' : 'rgba(30, 64, 175, 0.3)'}`
      : 'none',
  });

  const indicatorHoverStyle = {
    backgroundColor: isDarkTheme ? '#3b82f6' : '#1e40af',
    width: '24px',
    transform: 'scale(1.1)',
  };

  // Slide counter - only show if we have slides
  const slideCounterStyle = {
    position: 'absolute',
    bottom: '40px',
    right: '20px',
    color: isDarkTheme ? 'white' : '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    backgroundColor: isDarkTheme 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(255, 255, 255, 0.7)',
    padding: '8px 16px',
    borderRadius: '20px',
    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
    zIndex: 30,
    display: slides.length > 0 ? 'block' : 'none',
  };

  if (isLoading) {
    return (
      <div style={loadingStyle}>
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
    <div style={mainContainerStyle}>
      {/* Theme Toggle Button */}
      <button
        style={themeToggleStyle}
        onClick={toggleTheme}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
        }}
        aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDarkTheme ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Static background (shows when no slides available) */}
      <div style={staticBackgroundStyle} />

      {/* Slideshow Background (only shows if we have slides) */}
      {slides.length > 0 && (
        <div style={slideshowContainerStyle}>
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
          
          {/* Enhanced overlays for better text visibility */}
          <div style={darkOverlayStyle} />
          <div style={leftOverlayStyle} />
        </div>
      )}

      {/* Navigation Arrows - Hide on mobile for better experience */}
      {window.innerWidth > 768 && (
        <>
          <button
            style={{ ...navButtonStyle, left: '20px' }}
            onClick={goToPrevSlide}
            onMouseEnter={(e) => Object.assign(e.target.style, navButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, { ...navButtonStyle, left: '20px' })}
            aria-label="Previous slide"
          >
            ←
          </button>
          
          <button
            style={{ ...navButtonStyle, right: '20px' }}
            onClick={goToNextSlide}
            onMouseEnter={(e) => Object.assign(e.target.style, navButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.target.style, { ...navButtonStyle, right: '20px' })}
            aria-label="Next slide"
          >
            →
          </button>
        </>
      )}

      {/* Slide Indicators */}
      <div style={indicatorsContainerStyle}>
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => goToSlide(index)}
            style={indicatorStyle(index === currentSlide)}
            onMouseEnter={(e) => index !== currentSlide && Object.assign(e.target.style, indicatorHoverStyle)}
            onMouseLeave={(e) => index !== currentSlide && Object.assign(e.target.style, indicatorStyle(false))}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div style={slideCounterStyle}>
        {slides.length > 0 && `${currentSlide + 1} / ${slides.length}`}
      </div>

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
          position: 'relative',
          zIndex: 40,
        }}>
          <h1 style={heroTitleStyle}>
            Your Safety is Our{' '}
            <span style={accentTextStyle}>Priority</span>
          </h1>
          
          <p style={heroSubtitleStyle}>
            Discover premium fire safety equipment and professional services to protect what matters most. 
            Certified products, expert installation, and 24/7 support for complete peace of mind.
          </p>
          
          <div style={heroButtonsContainerStyle}>
            <Link
              to="/products"
              style={primaryButtonStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, primaryButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, primaryButtonStyle)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                Browse Products
                <ChevronRight size={20} />
              </span>
            </Link>
            
            {!user && (
              <Link
                to="/register"
                style={secondaryButtonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, secondaryButtonHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, secondaryButtonStyle)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  Get Started
                  <ChevronRight size={20} />
                </span>
              </Link>
            )}
          </div>

          {/* Stats Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(20px, 4vw, 60px)',
            flexWrap: 'wrap',
            marginTop: 'clamp(40px, 6vw, 80px)',
            padding: 'clamp(20px, 3vw, 30px)',
            background: isDarkTheme
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.03) 0%, rgba(59, 130, 246, 0.02) 100%)',
            borderRadius: '25px',
            border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>500+</div>
              <div style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)' }}>Safety Products</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>1K+</div>
              <div style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)' }}>Happy Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)' }}>Expert Support</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>100%</div>
              <div style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)' }}>Certified Quality</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the content */}
      <div style={{ 
        backgroundColor: isDarkTheme ? '#ffffff' : '#f8fafc', 
        width: '100%',
        position: 'relative',
        zIndex: 30,
      }}>
        {/* Features Section */}
        <section style={{ 
          padding: 'clamp(60px, 8vw, 120px) 20px', 
          textAlign: 'center', 
          backgroundColor: isDarkTheme ? '#ffffff' : '#f8fafc',
          width: '100%',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <div style={{
              marginBottom: 'clamp(40px, 6vw, 80px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.75rem, 4vw, 3.5rem)', 
                fontWeight: 900, 
                marginBottom: 'clamp(15px, 2vw, 20px)', 
                color: '#1e293b',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.025em',
              }}>
                Why Choose Morden Safety?
              </h2>
              <p style={{ 
                fontSize: 'clamp(0.95rem, 1.5vw, 1.25rem)', 
                marginBottom: 'clamp(40px, 6vw, 60px)', 
                color: '#64748b', 
                maxWidth: '700px', 
                margin: '0 auto clamp(40px, 6vw, 60px)',
                lineHeight: 1.8,
              }}>
                We provide comprehensive fire safety solutions for homes and businesses with certified products and professional services
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'clamp(25px, 2.5vw, 40px)',
              alignItems: 'stretch',
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    ...cardStyle,
                    padding: 'clamp(25px, 3vw, 40px) clamp(20px, 2vw, 25px)',
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '20px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
                    flex: '1 1 250px',
                    maxWidth: '300px',
                    margin: '0 auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.borderColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <div style={{ 
                    width: 'clamp(80px, 8vw, 90px)',
                    height: 'clamp(80px, 8vw, 90px)',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 28px',
                    flexShrink: 0,
                    boxShadow: '0 12px 25px rgba(59, 130, 246, 0.12)',
                  }}>
                    {React.cloneElement(feature.icon, { 
                      size: 46,
                      style: { 
                        color: '#3b82f6',
                        filter: 'drop-shadow(0 3px 6px rgba(59, 130, 246, 0.25))'
                      }
                    })}
                  </div>
                  <h3 style={{ 
                    fontSize: 'clamp(1.15rem, 1.3vw, 1.4rem)', 
                    fontWeight: 800, 
                    marginBottom: '14px', 
                    color: '#1e293b',
                    flexGrow: 0,
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    fontSize: 'clamp(0.85rem, 1vw, 1rem)', 
                    color: '#64748b',
                    lineHeight: 1.6,
                    marginTop: 'auto',
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: 'clamp(80px, 8vw, 140px) 20px',
          textAlign: 'center',
          background: isDarkTheme
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          position: 'relative',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 10,
          }}>
            <h2 style={{ 
              fontSize: 'clamp(1.75rem, 4vw, 3.5rem)', 
              fontWeight: 900, 
              marginBottom: '32px',
              color: 'white',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              letterSpacing: '-0.025em',
            }}>
              Ready to Enhance Your Safety?
            </h2>
            <p style={{ 
              fontSize: 'clamp(0.95rem, 1.5vw, 1.3rem)', 
              marginBottom: 'clamp(30px, 4vw, 50px)', 
              color: '#dbeafe',
              lineHeight: 1.8,
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              Join thousands of satisfied customers who trust Morden Safety for their protection needs. 
              Get certified equipment, professional installation, and peace of mind.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 'clamp(20px, 2vw, 30px)', 
              flexWrap: 'wrap' 
            }}>
              <Link
                to={user ? '/service-request' : '/register'}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  padding: 'clamp(18px, 2vw, 22px) clamp(32px, 4vw, 48px)',
                  fontSize: 'clamp(16px, 1.5vw, 18px)',
                  fontWeight: 800,
                  borderRadius: '15px',
                  boxShadow: '0 15px 40px rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px) scale(1.05)';
                  e.target.style.backgroundColor = '#f0f9ff';
                  e.target.style.boxShadow = '0 25px 50px rgba(255, 255, 255, 0.3)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 15px 40px rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user ? 'Request Service' : 'Get Started'}
                  <ChevronRight size={20} />
                </span>
              </Link>
              <Link
                to="/products"
                style={{
                  ...buttonStyle,
                  backgroundColor: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: 'clamp(18px, 2vw, 22px) clamp(32px, 4vw, 48px)',
                  fontSize: 'clamp(16px, 1.5vw, 18px)',
                  fontWeight: 800,
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px) scale(1.05)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = '0 25px 50px rgba(255, 255, 255, 0.15)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  View Products
                  <ChevronRight size={20} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .hero-content h1 {
            animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
          }
          
          .hero-content p {
            animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
          }
          
          .hero-buttons {
            animation: fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
          }
          
          .stats-container {
            animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
          }
          
          /* Auto slideshow progress indicator */
          @keyframes slideProgress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
          
          .slide-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: #3b82f6;
            animation: slideProgress 10s linear;
            border-radius: 0 0 0 0;
            z-index: 31;
          }
          
          /* Mobile responsive fixes */
          @media (max-width: 768px) {
            .left-overlay {
              display: none !important;
            }
            
            .hero-section h1 {
              font-size: 2.5rem !important;
              line-height: 1.2 !important;
            }
            
            .hero-section p {
              font-size: 1.1rem !important;
              padding: 15px !important;
              margin-bottom: 30px !important;
            }
            
            .hero-buttons {
              flex-direction: column;
              align-items: center;
              gap: 15px !important;
            }
            
            .hero-buttons a {
              width: 100%;
              max-width: 300px;
              text-align: center;
            }
            
            .stats-container {
              gap: 30px !important;
              padding: 20px !important;
            }
            
            .stats-container div {
              flex: 0 0 calc(50% - 15px);
            }
            
            .features-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            
            .feature-card {
              max-width: 100% !important;
              padding: 25px 20px !important;
            }
            
            .nav-buttons {
              display: none !important;
            }
            
            .theme-toggle {
              width: 45px !important;
              height: 45px !important;
              top: 15px !important;
              right: 15px !important;
            }
            
            .slide-counter {
              bottom: 80px !important;
              right: 15px !important;
              padding: 6px 12px !important;
              font-size: 12px !important;
            }
          }
          
          @media (max-width: 480px) {
            .hero-section h1 {
              font-size: 2rem !important;
            }
            
            .hero-section p {
              font-size: 1rem !important;
              line-height: 1.6 !important;
            }
            
            .stats-container div {
              flex: 0 0 100%;
            }
            
            .cta-buttons {
              flex-direction: column;
              align-items: center;
            }
            
            .cta-buttons a {
              width: 100%;
              max-width: 280px;
            }
          }
          
          /* Tablet responsive */
          @media (min-width: 769px) and (max-width: 1024px) {
            .features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .feature-card {
              max-width: 100% !important;
            }
            
            .hero-buttons {
              gap: 20px !important;
            }
            
            .hero-buttons a {
              padding: 18px 36px !important;
              font-size: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;