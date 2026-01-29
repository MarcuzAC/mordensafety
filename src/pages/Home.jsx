import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Truck, Users, Award } from 'lucide-react';

const Home = () => {
  const { user } = useApp();
  
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

  // Main container with darker gradient
  const mainContainerStyle = {
    position: 'relative',
    width: '100%',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 100%)',
  };

  // Hero section with darker overlay
  const heroSectionStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
    position: 'relative',
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

  // Updated scroll indicator without arrow
  const scrollIndicatorStyle = {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    textAlign: 'center',
    animation: 'bounce 2s infinite',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div style={mainContainerStyle}>
      {/* Hero Section */}
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

          {/* Scroll indicator without arrow */}
          <div style={scrollIndicatorStyle}>
            Scroll to explore more
          </div>
        </div>
      </section>

      {/* Rest of the content */}
      <div style={{ 
        backgroundColor: 'white', 
        width: '100%',
        position: 'relative',
      }}>
        {/* Features Section */}
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