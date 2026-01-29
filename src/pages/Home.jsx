import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Truck, Users, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import { productsAPI, getFullImageUrl } from '../services/api';

const Home = () => {
  const { user } = useApp();
  const [backgroundProducts, setBackgroundProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slideInterval = useRef(null);
  const [imagePositions, setImagePositions] = useState([]);

  // Mock product images for background slideshow
  const productImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&h=900&fit=crop'
  ];

  useEffect(() => {
    // Initialize image positions for sliding effect
    const positions = productImages.map((_, index) => ({
      x: 100 + (index * 100), // Start images staggered
      y: 30 + (index * 10),   // Slight vertical variation
      scale: 0.8 + (index * 0.05), // Different scales
      rotation: -5 + (index * 2), // Slight rotation
      zIndex: productImages.length - index // Stacking order
    }));
    setImagePositions(positions);
    startSlideshow();
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, []);

  const startSlideshow = () => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % productImages.length);
      // Update positions for sliding effect
      setImagePositions(prev => {
        return prev.map((pos, index) => ({
          ...pos,
          x: pos.x - 0.5, // Move left slowly
          // Reset position when it goes off screen
          ...(pos.x < -20 && {
            x: 120,
            y: 30 + (Math.random() * 40),
            scale: 0.8 + (Math.random() * 0.3),
            rotation: -10 + (Math.random() * 20)
          })
        }));
      });
    }, 50); // Faster animation for smoother sliding
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

  // Main container with sliding background
  const mainContainerStyle = {
    position: 'relative',
    width: '100%',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    overflow: 'hidden',
  };

  // Hero section - FIXED: No overlay, content sits above background
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

  // Sliding background images container
  const backgroundContainerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    zIndex: 1,
  };

  // Individual sliding image
  const slidingImageStyle = (index) => ({
    position: 'absolute',
    top: `${imagePositions[index]?.y || 30}%`,
    left: `${imagePositions[index]?.x || 100}%`,
    width: '600px',
    height: '450px',
    backgroundImage: `url(${productImages[index]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '30px',
    transform: `translate(-50%, -50%) scale(${imagePositions[index]?.scale || 1}) rotate(${imagePositions[index]?.rotation || 0}deg)`,
    filter: 'brightness(0.4) saturate(1.3) blur(2px)',
    opacity: 0.6,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    zIndex: imagePositions[index]?.zIndex || 1,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  // Modern gradient overlay (behind text but above sliding images)
  const gradientOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.7) 30%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.3) 70%, rgba(15, 23, 42, 0.1) 100%)',
    zIndex: 5,
  };

  // Side gradient overlays for better text contrast
  const leftGradientStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '50%',
    height: '100vh',
    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%)',
    zIndex: 10,
  };

  const rightGradientStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '30%',
    height: '100vh',
    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.7) 100%)',
    zIndex: 10,
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
    position: 'relative',
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
    position: 'relative',
    overflow: 'hidden',
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
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const secondaryButtonHoverStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-5px) scale(1.05)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    boxShadow: '0 20px 40px rgba(255, 255, 255, 0.2)',
  };

  // Floating element style for decorative elements
  const floatingElementStyle = (delay) => ({
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    animation: `float 6s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    zIndex: 2,
  });

  return (
    <div style={mainContainerStyle}>
      {/* Sliding Background Images */}
      <div style={backgroundContainerStyle}>
        {productImages.map((image, index) => (
          <div
            key={index}
            style={slidingImageStyle(index)}
          />
        ))}
      </div>

      {/* Gradient Overlays for better text visibility */}
      <div style={gradientOverlayStyle} />
      <div style={leftGradientStyle} />
      <div style={rightGradientStyle} />

      {/* Floating decorative elements */}
      <div style={{ ...floatingElementStyle(0), top: '20%', left: '10%' }} />
      <div style={{ ...floatingElementStyle(2), top: '60%', left: '15%', width: '150px', height: '150px' }} />
      <div style={{ ...floatingElementStyle(4), top: '30%', right: '10%', width: '80px', height: '80px' }} />

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px',
          position: 'relative',
          zIndex: 30,
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
          overflow: 'hidden',
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
          
          {/* Floating elements in CTA */}
          <div style={{ ...floatingElementStyle(1), top: '20%', left: '10%', width: '120px', height: '120px' }} />
          <div style={{ ...floatingElementStyle(3), top: '70%', right: '15%', width: '80px', height: '80px' }} />
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
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
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
            animation: slideIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
          }
          
          /* Glow effect for buttons */
          .primary-button::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #3b82f6, #60a5fa, #3b82f6);
            border-radius: 12px;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.4s ease;
          }
          
          .primary-button:hover::before {
            opacity: 0.3;
          }
        `}
      </style>
    </div>
  );
};

export default Home;