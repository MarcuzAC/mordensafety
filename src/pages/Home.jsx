import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Truck, Users, Award, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideInterval = useRef(null);

  // High-quality product images for slideshow
  const slides = [
    {
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&h=1080&fit=crop&q=80',
      title: 'Premium Fire Extinguishers',
      description: 'Certified safety equipment for every need'
    },
    {
      url: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1920&h=1080&fit=crop&q=80',
      title: 'Professional Installation',
      description: 'Expert setup and maintenance services'
    },
    {
      url: 'https://images.unsplash.com/photo-1581094792932-e5c8a7f1be20?w=1920&h=1080&fit=crop&q=80',
      title: 'Safety Gear & Equipment',
      description: 'Complete protection solutions'
    },
    {
      url: 'https://images.unsplash.com/photo-1581092580497-e0d4cb184827?w=1920&h=1080&fit=crop&q=80',
      title: 'Industrial Safety Systems',
      description: 'Large-scale fire protection'
    },
    {
      url: 'https://images.unsplash.com/photo-1581092580576-6d4d4f3702e9?w=1920&h=1080&fit=crop&q=80',
      title: 'Residential Safety',
      description: 'Home fire protection solutions'
    }
  ];

  useEffect(() => {
    startSlideshow();
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const startSlideshow = () => {
    slideInterval.current = setInterval(() => {
      goToNextSlide();
    }, 10000); // 10 seconds delay
  };

  const goToNextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 800); // Match transition duration
  };

  const goToPrevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 800);
  };

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    
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
    backgroundColor: '#ffffff',
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

  // Slideshow container
  const slideshowContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    zIndex: 1,
  };

  // Individual slide - Enhanced with better brightness
  const slideStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transform: 'translateX(100%)',
    opacity: 0,
    transition: 'all 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
    filter: 'brightness(0.7) saturate(1.3)', // Increased brightness
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
    background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.4) 100%)',
    zIndex: 2,
  };

  const leftOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 100%)',
    zIndex: 3,
  };

  const heroTitleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontWeight: 900,
    color: 'white',
    marginBottom: '24px',
    textShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
    lineHeight: 1.1,
    maxWidth: '900px',
    letterSpacing: '-0.025em',
    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const heroSubtitleStyle = {
    fontSize: 'clamp(1.1rem, 2vw, 1.8rem)',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '48px',
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
    maxWidth: '800px',
    lineHeight: 1.7,
    fontWeight: 400,
    backdropFilter: 'blur(4px)',
    padding: '20px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const accentTextStyle = {
    color: '#60a5fa',
    fontWeight: 900,
    textShadow: '0 4px 20px rgba(96, 165, 250, 0.5)',
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
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '20px 48px',
    fontSize: '18px',
    fontWeight: 700,
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const primaryButtonHoverStyle = {
    backgroundColor: '#2563eb',
    transform: 'translateY(-5px) scale(1.05)',
    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    padding: '20px 48px',
    fontSize: '18px',
    fontWeight: 700,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const secondaryButtonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-5px) scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    boxShadow: '0 20px 40px rgba(255, 255, 255, 0.2)',
  };

  // Navigation buttons
  const navButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    zIndex: 30,
    fontSize: '24px',
  };

  const navButtonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: 'translateY(-50%) scale(1.1)',
  };

  // Slide indicators
  const indicatorsContainerStyle = {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
    zIndex: 30,
  };

  const indicatorStyle = (active) => ({
    width: active ? '40px' : '12px',
    height: '12px',
    borderRadius: '6px',
    backgroundColor: active ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: active ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
  });

  const indicatorHoverStyle = {
    backgroundColor: '#3b82f6',
    width: '24px',
    transform: 'scale(1.1)',
  };

  // Slide counter
  const slideCounterStyle = {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    zIndex: 30,
  };

  return (
    <div style={mainContainerStyle}>
      {/* Slideshow Background */}
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
            />
          );
        })}
        
        {/* Enhanced overlays for better text visibility */}
        <div style={darkOverlayStyle} />
        <div style={leftOverlayStyle} />
      </div>

      {/* Navigation Arrows */}
      <button
        style={{ ...navButtonStyle, left: '30px' }}
        onClick={goToPrevSlide}
        onMouseEnter={(e) => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, { ...navButtonStyle, left: '30px' })}
        aria-label="Previous slide"
      >
        ←
      </button>
      
      <button
        style={{ ...navButtonStyle, right: '30px' }}
        onClick={goToNextSlide}
        onMouseEnter={(e) => Object.assign(e.target.style, navButtonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.target.style, { ...navButtonStyle, right: '30px' })}
        aria-label="Next slide"
      >
        →
      </button>

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
        {currentSlide + 1} / {slides.length}
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
            gap: '60px',
            flexWrap: 'wrap',
            marginTop: '80px',
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            borderRadius: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>500+</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>Safety Products</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>10K+</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>Happy Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>Expert Support</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>100%</div>
              <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)' }}>Certified Quality</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the content */}
      <div style={{ 
        backgroundColor: 'white', 
        width: '100%',
        position: 'relative',
        zIndex: 30,
      }}>
        {/* Features Section */}
        <section style={{ 
          padding: 'clamp(60px, 8vw, 120px) 20px', 
          textAlign: 'center', 
          backgroundColor: 'white',
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
                fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
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
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', 
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
              gap: 'clamp(30px, 3vw, 50px)',
              alignItems: 'stretch',
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    ...cardStyle,
                    padding: '40px 30px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '25px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px)';
                    e.currentTarget.style.boxShadow = '0 30px 80px rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.borderColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <div style={{ 
                    width: '100px',
                    height: '100px',
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    flexShrink: 0,
                    boxShadow: '0 15px 30px rgba(59, 130, 246, 0.15)',
                  }}>
                    {React.cloneElement(feature.icon, { 
                      size: 52,
                      style: { 
                        color: '#3b82f6',
                        filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))'
                      }
                    })}
                  </div>
                  <h3 style={{ 
                    fontSize: 'clamp(1.25rem, 1.5vw, 1.75rem)', 
                    fontWeight: 800, 
                    marginBottom: '16px', 
                    color: '#1e293b',
                    flexGrow: 0,
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    fontSize: 'clamp(0.9rem, 1.1vw, 1.1rem)', 
                    color: '#64748b',
                    lineHeight: 1.7,
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
              fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
              fontWeight: 900, 
              marginBottom: '32px',
              color: 'white',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              letterSpacing: '-0.025em',
            }}>
              Ready to Enhance Your Safety?
            </h2>
            <p style={{ 
              fontSize: 'clamp(1rem, 1.5vw, 1.3rem)', 
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
                  padding: '22px 48px',
                  fontSize: '18px',
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
                  padding: '22px 48px',
                  fontSize: '18px',
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
        `}
      </style>
    </div>
  );
};

export default Home;