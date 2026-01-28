import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Truck, Users, Award } from 'lucide-react';
import { productsAPI, getFullImageUrl } from '../services/api';

const Home = () => {
  const { user } = useApp();
  const [backgroundProducts, setBackgroundProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slideInterval = useRef(null);

  useEffect(() => {
    fetchBackgroundProducts();
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const fetchBackgroundProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getProducts({
        available_only: true,
        limit: 8 // Limit to 8 products for background
      });
      
      if (response.data.products && response.data.products.length > 0) {
        // Shuffle products randomly
        const shuffled = [...response.data.products]
          .sort(() => Math.random() - 0.5)
          .filter(product => product.images && product.images.length > 0)
          .slice(0, 6); // Use up to 6 products with images
        
        setBackgroundProducts(shuffled);
      }
    } catch (error) {
      console.error('Error fetching background products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (backgroundProducts.length > 1 && !slideInterval.current) {
      startSlideshow();
    }
  }, [backgroundProducts]);

  const startSlideshow = () => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % backgroundProducts.length);
    }, 4000);
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
    backgroundColor: '#e0f2ff',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  };

  // Main container with background
  const mainContainerStyle = {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
  };

  // Background slideshow container - NOW BEHIND THE TEXT
  const backgroundContainerStyle = {
    position: 'fixed', // Changed from relative to fixed
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1, // Behind everything
  };

  // Individual slide styles
  const slideStyle = (index) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'opacity 1.5s ease-in-out',
    opacity: index === currentSlide ? 1 : 0,
    zIndex: 1,
    // Dim the images for better text readability
    filter: 'brightness(0.6) saturate(1.2) blur(1px)',
    transform: 'scale(1.1)', // Slight zoom for depth
  });

  // Dark overlay for better text contrast
  const darkOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%)',
    zIndex: 2,
  };

  // Content container that sits above background
  const contentContainerStyle = {
    position: 'relative',
    zIndex: 3, // Above background
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Hero section - transparent over background
  const heroSectionStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
  };

  const heroTitleStyle = {
    fontSize: '4rem',
    fontWeight: 800,
    color: 'white',
    marginBottom: '24px',
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    lineHeight: 1.2,
    maxWidth: '900px',
  };

  const heroSubtitleStyle = {
    fontSize: '1.5rem',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '40px',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '700px',
    lineHeight: 1.6,
  };

  const accentTextStyle = {
    color: '#93c5fd',
    fontWeight: 900,
  };

  const heroButtonsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '20px',
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '16px 36px',
    fontSize: '18px',
    fontWeight: 700,
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  };

  const primaryButtonHoverStyle = {
    backgroundColor: '#2563eb',
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    padding: '16px 36px',
    fontSize: '18px',
    fontWeight: 700,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  };

  const secondaryButtonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-3px) scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  };

  // Scroll indicator
  const scrollIndicatorStyle = {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    textAlign: 'center',
    animation: 'bounce 2s infinite',
  };

  // Slideshow indicators
  const indicatorsContainerStyle = {
    position: 'absolute',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    zIndex: 10,
  };

  const indicatorStyle = (active) => ({
    width: active ? '24px' : '8px',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: active ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
  });

  return (
    <div style={mainContainerStyle}>
      {/* Background Slideshow - BEHIND THE TEXT */}
      {!isLoading && backgroundProducts.length > 0 && (
        <div style={backgroundContainerStyle}>
          {backgroundProducts.map((product, index) => {
            const imageUrl = product.images && product.images.length > 0 
              ? getFullImageUrl(product.images[0])
              : null;
            
            return (
              <div
                key={product.id}
                style={{
                  ...slideStyle(index),
                  backgroundImage: imageUrl 
                    ? `url(${imageUrl})`
                    : 'linear-gradient(135deg, #1e3c72 0%, #3b82f6 100%)',
                }}
              />
            );
          })}
          {/* Dark overlay for better text contrast */}
          <div style={darkOverlayStyle} />
        </div>
      )}

      {/* Main Content - TEXT OVER BACKGROUND */}
      <div style={contentContainerStyle}>
        {/* Hero Section */}
        <section style={heroSectionStyle}>
          <h1 style={heroTitleStyle}>
            Your Safety is Our{' '}
            <span style={accentTextStyle}>Priority</span>
          </h1>
          
          <p style={heroSubtitleStyle}>
            Discover premium fire safety equipment and professional services to protect what matters most
          </p>
          
          <div style={heroButtonsContainerStyle}>
            <Link
              to="/products"
              style={primaryButtonStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, primaryButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, primaryButtonStyle)}
            >
              Browse Products
            </Link>
            
            {!user && (
              <Link
                to="/register"
                style={secondaryButtonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, secondaryButtonHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, secondaryButtonStyle)}
              >
                Create Account
              </Link>
            )}
          </div>

          {/* Scroll indicator */}
          <div style={scrollIndicatorStyle}>
            Scroll to explore more
            <div style={{ marginTop: '8px', fontSize: '24px' }}>↓</div>
          </div>
        </section>

        {/* Rest of the sections (Features, CTA) remain with white background */}
        <div style={{ backgroundColor: 'white', width: '100%' }}>
          {/* Features Section */}
          <section style={{ 
            padding: '100px 20px', 
            textAlign: 'center', 
            backgroundColor: 'white',
            width: '100%',
          }}>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: 800, 
              marginBottom: '20px', 
              color: '#1e293b',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Why Choose Morden Safety?
            </h2>
            <p style={{ 
              fontSize: '1.25rem', 
              marginBottom: '60px', 
              color: '#64748b', 
              maxWidth: '700px', 
              margin: '0 auto 60px',
              lineHeight: 1.6,
            }}>
              We provide comprehensive fire safety solutions for homes and businesses
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    ...cardStyle,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.4s ease',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.borderColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ 
                    marginBottom: '24px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    marginBottom: '12px', 
                    color: '#1e293b' 
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#64748b',
                    lineHeight: 1.6,
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section style={{
            padding: '100px 20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: 'white',
            marginTop: '60px',
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              <h2 style={{ 
                fontSize: '3rem', 
                fontWeight: 800, 
                marginBottom: '24px',
                color: 'white',
              }}>
                Ready to Enhance Your Safety?
              </h2>
              <p style={{ 
                fontSize: '1.25rem', 
                marginBottom: '40px', 
                color: '#dbeafe',
                lineHeight: 1.6,
              }}>
                Join thousands of satisfied customers who trust Morden Safety for their protection needs
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '20px', 
                flexWrap: 'wrap' 
              }}>
                <Link
                  to={user ? '/service-request' : '/register'}
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'white',
                    color: '#3b82f6',
                    padding: '18px 40px',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.backgroundColor = '#f0f9ff';
                    e.target.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.backgroundColor = 'white';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {user ? 'Request Service' : 'Get Started'}
                </Link>
                <Link
                  to="/products"
                  style={{
                    ...buttonStyle,
                    backgroundColor: 'transparent',
                    border: '2px solid white',
                    color: 'white',
                    padding: '18px 40px',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  View Products
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Slideshow indicators */}
      {!isLoading && backgroundProducts.length > 1 && (
        <div style={indicatorsContainerStyle}>
          {backgroundProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                if (slideInterval.current) {
                  clearInterval(slideInterval.current);
                  slideInterval.current = null;
                }
                setTimeout(startSlideshow, 10000);
              }}
              style={indicatorStyle(index === currentSlide)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Animation styles */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            40% {
              transform: translateX(-50%) translateY(-10px);
            }
            60% {
              transform: translateX(-50%) translateY(-5px);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          h1, p, .hero-buttons {
            animation: fadeIn 1s ease-out;
          }
          
          h1 {
            animation-delay: 0.2s;
          }
          
          p {
            animation-delay: 0.4s;
          }
          
          .hero-buttons {
            animation-delay: 0.6s;
          }
        `}
      </style>
    </div>
  );
};

export default Home;