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
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
        slideInterval.current = null;
      }
    };
  }, [backgroundProducts]);

  const startSlideshow = () => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => {
        // Get a random slide that's not the current one
        let nextSlide;
        do {
          nextSlide = Math.floor(Math.random() * backgroundProducts.length);
        } while (nextSlide === prev && backgroundProducts.length > 1);
        
        return nextSlide;
      });
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

  // Main container - FIXED: Remove fixed height
  const mainContainerStyle = {
    position: 'relative',
    width: '100%',
    fontFamily: "'Poppins', sans-serif",
  };

  // Background slideshow container - FIXED: Set proper positioning
  const backgroundContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    zIndex: -1, // Set to -1 to be behind everything
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
    filter: 'brightness(0.6) saturate(1.2)',
  });

  // Dark overlay - FIXED: Less opaque for better visibility
  const darkOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.2) 100%)',
    zIndex: 2,
  };

  // Hero section - FIXED: Set proper height and positioning
  const heroSectionStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
    position: 'relative', // Add relative positioning
  };

  const heroTitleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 800,
    color: 'white',
    marginBottom: '24px',
    textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    lineHeight: 1.2,
    maxWidth: '900px',
  };

  const heroSubtitleStyle = {
    fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '40px',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    maxWidth: '700px',
    lineHeight: 1.6,
  };

  const accentTextStyle = {
    color: '#93c5fd',
    fontWeight: 900,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
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
    padding: 'clamp(14px, 2vw, 16px) clamp(28px, 3vw, 36px)',
    fontSize: 'clamp(16px, 1.5vw, 18px)',
    fontWeight: 700,
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(4px)',
  };

  const primaryButtonHoverStyle = {
    backgroundColor: '#2563eb',
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    padding: 'clamp(14px, 2vw, 16px) clamp(28px, 3vw, 36px)',
    fontSize: 'clamp(16px, 1.5vw, 18px)',
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
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    textAlign: 'center',
    animation: 'bounce 2s infinite',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  // Slideshow indicators
  const indicatorsContainerStyle = {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    zIndex: 100,
  };

  const indicatorStyle = (active) => ({
    width: active ? '24px' : '8px',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: active ? '#3b82f6' : 'rgba(255, 255, 255, 0.7)',
    border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  });

  return (
    <div style={mainContainerStyle}>
      {/* Background Slideshow - FIXED: z-index -1 */}
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
                  backgroundSize: 'cover',
                }}
              />
            );
          })}
          {/* Dark overlay */}
          <div style={darkOverlayStyle} />
        </div>
      )}

      {/* Hero Section - FIXED: Separate from content container */}
      <section style={heroSectionStyle}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
          position: 'relative',
          zIndex: 10,
        }}>
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
        </div>
      </section>

      {/* Rest of the content - Starts after hero section */}
      <div style={{ 
        backgroundColor: 'white', 
        width: '100%',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Features Section - IMPROVED: Better responsive cards */}
        <section style={{ 
          padding: 'clamp(60px, 8vw, 100px) 20px', 
          textAlign: 'center', 
          backgroundColor: 'white',
          width: '100%',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: 800, 
              marginBottom: 'clamp(15px, 2vw, 20px)', 
              color: '#1e293b',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Why Choose Morden Safety?
            </h2>
            <p style={{ 
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', 
              marginBottom: 'clamp(40px, 6vw, 60px)', 
              color: '#64748b', 
              maxWidth: '700px', 
              margin: '0 auto clamp(40px, 6vw, 60px)',
              lineHeight: 1.6,
            }}>
              We provide comprehensive fire safety solutions for homes and businesses
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: 'clamp(20px, 3vw, 40px)',
              alignItems: 'stretch',
            }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.borderColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <div style={{ 
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    flexShrink: 0,
                  }}>
                    {React.cloneElement(feature.icon, { size: 48 })}
                  </div>
                  <h3 style={{ 
                    fontSize: 'clamp(1.25rem, 1.5vw, 1.5rem)', 
                    fontWeight: 700, 
                    marginBottom: '12px', 
                    color: '#1e293b',
                    flexGrow: 0,
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{ 
                    fontSize: 'clamp(0.9rem, 1.1vw, 1rem)', 
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
          padding: 'clamp(60px, 8vw, 100px) 20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: 'white',
          marginTop: 'clamp(40px, 6vw, 60px)',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            <h2 style={{ 
              fontSize: 'clamp(2rem, 4vw, 3rem)', 
              fontWeight: 800, 
              marginBottom: '24px',
              color: 'white',
            }}>
              Ready to Enhance Your Safety?
            </h2>
            <p style={{ 
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', 
              marginBottom: 'clamp(30px, 4vw, 40px)', 
              color: '#dbeafe',
              lineHeight: 1.6,
            }}>
              Join thousands of satisfied customers who trust Morden Safety for their protection needs
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 'clamp(15px, 2vw, 20px)', 
              flexWrap: 'wrap' 
            }}>
              <Link
                to={user ? '/service-request' : '/register'}
                style={{
                  ...buttonStyle,
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  padding: 'clamp(16px, 2vw, 18px) clamp(32px, 3vw, 40px)',
                  fontSize: 'clamp(16px, 1.5vw, 18px)',
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
                  padding: 'clamp(16px, 2vw, 18px) clamp(32px, 3vw, 40px)',
                  fontSize: 'clamp(16px, 1.5vw, 18px)',
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
          
          .hero-content h1, .hero-content p, .hero-buttons {
            animation: fadeIn 1s ease-out;
          }
          
          .hero-content h1 {
            animation-delay: 0.2s;
          }
          
          .hero-content p {
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