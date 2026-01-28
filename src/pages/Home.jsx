import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Truck, Users, Award } from 'lucide-react';
import { productsAPI } from '../services/api';

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

  // Helper function to get full image URL (same as in Products component)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/static/')) {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      return `${baseUrl}${imagePath}`;
    }
    
    if (!imagePath.includes('/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/static/products/${imagePath}`;
    }
    
    return imagePath;
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

  // Background slideshow container style
  const backgroundContainerStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100vh',
  };

  // Individual slide styles with proper brightness balancing
  const slideStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 1s ease-in-out, opacity 1s ease-in-out',
    willChange: 'transform, opacity',
  };

  // Overlay for better text readability
  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 100%)',
    zIndex: 1,
  };

  // Content container that sits above background
  const contentContainerStyle = {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 249, 255, 0.85)', // Semi-transparent background
  };

  // Hero section adjusted for background
  const heroStyle = {
    fontFamily: "'Poppins', sans-serif",
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'transparent',
    color: '#1e3c72',
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 3,
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", position: 'relative' }}>
      {/* Background Slideshow */}
      {!isLoading && backgroundProducts.length > 0 && (
        <div style={backgroundContainerStyle}>
          {backgroundProducts.map((product, index) => {
            const imageUrl = product.images && product.images.length > 0 
              ? getImageUrl(product.images[0])
              : null;
            
            return (
              <div
                key={product.id}
                style={{
                  ...slideStyle,
                  backgroundImage: imageUrl 
                    ? `url(${imageUrl})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  // Apply brightness filter - reduced brightness for background images
                  filter: 'brightness(0.5) saturate(1.1)',
                  // CSS transform for sliding animation
                  transform: `translateX(${index === currentSlide ? '0%' : 
                    index < currentSlide ? '-100%' : '100%'})`,
                  opacity: index === currentSlide ? 1 : 0,
                  // Additional overlay on image for better text contrast
                  '::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                {/* Optional: Product name overlay in background */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'right bottom',
                  whiteSpace: 'nowrap',
                }}>
                  {product.name}
                </div>
              </div>
            );
          })}
          
          {/* Gradient overlay for better text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(240, 249, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
            zIndex: 1,
          }} />
        </div>
      )}

      {/* Main Content */}
      <div style={contentContainerStyle}>
        {/* Hero Section */}
        <section style={heroStyle}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 700, 
            lineHeight: 1.2, 
            marginBottom: '20px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            Your Safety is Our{' '}
            <span style={{ color: '#3b82f6' }}>Priority</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#1e40af', 
            maxWidth: '700px', 
            margin: '0 auto 30px',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
          }}>
            Discover premium fire safety equipment and professional services to protect what matters most
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link
              to="/products"
              style={{
                ...buttonStyle,
                backgroundColor: '#3b82f6',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Browse Products
            </Link>
            {!user && (
              <Link
                to="/register"
                style={{
                  ...buttonStyle,
                  backgroundColor: '#fff',
                  color: '#3b82f6',
                  border: '2px solid #3b82f6',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#3b82f6';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Create Account
              </Link>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          width: '100%',
          marginTop: '40px',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            marginBottom: '10px', 
            color: '#1e3c72',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            Why Choose Morden Safety?
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            marginBottom: '50px', 
            color: '#1e40af', 
            maxWidth: '700px', 
            margin: '0 auto 50px' 
          }}>
            We provide comprehensive fire safety solutions for homes and businesses
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  ...cardStyle,
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(224, 242, 255, 0.95)',
                  backdropFilter: 'blur(5px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                  e.currentTarget.style.backgroundColor = 'rgba(224, 242, 255, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.backgroundColor = 'rgba(224, 242, 255, 0.95)';
                }}
              >
                <div style={{ marginBottom: '15px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: '#1e3c72' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '1rem', color: '#1e40af' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '60px 20px',
          borderRadius: '20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(30, 64, 175, 0.9))',
          color: '#fff',
          margin: '40px 20px',
          width: '90%',
          maxWidth: '1000px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '20px' }}>
            Ready to Enhance Your Safety?
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '30px', color: '#dbeafe' }}>
            Join thousands of satisfied customers who trust Morden Safety for their protection needs
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link
              to={user ? '/service-request' : '/register'}
              style={{
                ...buttonStyle,
                backgroundColor: '#fff',
                color: '#3b82f6',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#e0f2ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#fff';
              }}
            >
              {user ? 'Request Service' : 'Get Started'}
            </Link>
            <Link
              to="/products"
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                border: '2px solid #fff',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#fff';
              }}
            >
              View Products
            </Link>
          </div>
        </section>
      </div>

      {/* Slideshow indicators */}
      {!isLoading && backgroundProducts.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10,
        }}>
          {backgroundProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                if (slideInterval.current) {
                  clearInterval(slideInterval.current);
                  slideInterval.current = null;
                }
                setTimeout(startSlideshow, 10000); // Restart after 10 seconds
              }}
              style={{
                width: index === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: index === currentSlide ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;