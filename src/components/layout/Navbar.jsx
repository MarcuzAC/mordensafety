import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { notificationsAPI } from '../../services/api';
import { ShoppingCart, User, LogOut, Menu, X, Bell, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout, cartItemsCount } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoadingNotifications(true);
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load notifications when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Refresh notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 300000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  // Handle notification bell click
  const handleNotificationsClick = () => {
    if (!user) {
      console.log('No user found - ProtectedRoute will likely redirect to login');
    }
    
    try {
      navigate('/notifications');
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
  ];

  const authLinks = user
    ? [
        { path: '/service-request', label: 'Request Service' },
        { path: '/my-requests', label: 'My Requests' },
        { path: '/orders', label: 'My Orders', icon: <Package size={16} /> },
      ]
    : [];

  // Responsive base link style
  const baseLinkStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    padding: isMobile ? '4px 8px' : '6px 10px',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontSize: isMobile ? '14px' : '16px',
  };

  // Responsive button style
  const buttonStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    padding: isMobile ? '6px 12px' : isTablet ? '7px 14px' : '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontSize: isMobile ? '14px' : '16px',
  };

  // Navbar container style
  const navStyle = {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  // Container style
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '0 12px' : '0 16px',
  };

  // Main nav container
  const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: isMobile ? '56px' : '64px',
  };

  // Logo container
  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    flexShrink: 0,
  };

  // Logo style
  const logoStyle = {
    width: isMobile ? '32px' : '40px',
    height: isMobile ? '32px' : '40px',
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
    borderRadius: isMobile ? '8px' : '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: isMobile ? '14px' : '16px',
  };

  // Brand name
  const brandNameStyle = {
    fontSize: isMobile ? '16px' : isTablet ? '18px' : '20px',
    fontWeight: 700,
    color: '#1e3c72',
  };

  // Desktop navigation container
  const desktopNavStyle = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: isTablet ? '16px' : '24px',
    flexGrow: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  // Desktop auth section
  const desktopAuthStyle = {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
    gap: isTablet ? '12px' : '16px',
    flexShrink: 0,
  };

  // Mobile menu button
  const mobileMenuButtonStyle = {
    padding: '8px',
    display: isMobile ? 'flex' : 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#1e3c72',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Icon container style
  const iconContainerStyle = {
    position: 'relative',
    padding: isMobile ? '6px' : '8px',
    color: '#475569',
    transition: 'color 0.2s',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Notification badge style
  const badgeStyle = {
    position: 'absolute',
    top: isMobile ? '-2px' : '-4px',
    right: isMobile ? '-2px' : '-4px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: isMobile ? '10px' : '12px',
    borderRadius: '50%',
    width: isMobile ? '16px' : '20px',
    height: isMobile ? '16px' : '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Notification badge (orange)
  const notificationBadgeStyle = {
    ...badgeStyle,
    backgroundColor: '#f97316',
  };

  // User info container
  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '8px',
  };

  // User avatar
  const userAvatarStyle = {
    width: isMobile ? '28px' : '32px',
    height: isMobile ? '28px' : '32px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // User name
  const userNameStyle = {
    color: '#475569',
    fontWeight: 500,
    fontSize: isMobile ? '14px' : '16px',
  };

  // Logout button
  const logoutButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#475569',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    fontSize: isMobile ? '14px' : '16px',
  };

  // Mobile navigation
  const mobileNavStyle = {
    padding: isMobile ? '12px 0' : '16px 0',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '8px' : '12px',
  };

  // Mobile link style
  const mobileLinkStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    color: '#475569',
    textDecoration: 'none',
    padding: isMobile ? '6px 0' : '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: isMobile ? '15px' : '16px',
  };

  // Mobile button style
  const mobileButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: isMobile ? '6px 0' : '8px 0',
    textAlign: 'left',
    fontSize: isMobile ? '15px' : '16px',
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={navContainerStyle}>
          {/* Logo */}
          <Link to="/" style={logoContainerStyle}>
            <div style={logoStyle}>
              MS
            </div>
            <span style={brandNameStyle}>Morden Safety</span>
          </Link>

          {/* Desktop Navigation */}
          <div style={desktopNavStyle}>
            {[...navLinks, ...authLinks].map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    ...baseLinkStyle,
                    color: isActive ? '#3b82f6' : '#475569',
                    borderBottom: isActive ? '2px solid #3b82f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: link.icon ? '6px' : '0',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.target.style.color = '#1e40af';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.target.style.color = '#475569';
                  }}
                >
                  {link.icon && link.icon}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div style={desktopAuthStyle}>
            {user ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  style={iconContainerStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  <ShoppingCart size={isMobile ? 20 : 24} />
                  {cartItemsCount > 0 && (
                    <span style={badgeStyle}>
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <button
                  onClick={handleNotificationsClick}
                  style={{
                    ...iconContainerStyle,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                  title={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} new)` : ''}`}
                >
                  <Bell size={isMobile ? 20 : 24} />
                  {unreadNotifications > 0 && (
                    <span style={notificationBadgeStyle}>
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* User Info */}
                <div style={userInfoStyle}>
                  <div style={userAvatarStyle}>
                    <User size={isMobile ? 14 : 16} color="#3b82f6" />
                  </div>
                  <span style={userNameStyle}>
                    {isTablet ? user.full_name.split(' ')[0] : user.full_name}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  style={logoutButtonStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  <LogOut size={isMobile ? 18 : 20} />
                  <span style={{ display: isTablet ? 'none' : 'inline' }}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: '#475569',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.target.style.color = '#475569')}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    ...buttonStyle,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {isTablet ? 'Register' : 'Get Started'}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            style={mobileMenuButtonStyle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div style={mobileNavStyle}>
            {[...navLinks, ...authLinks].map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    ...mobileLinkStyle,
                    color: isActive ? '#3b82f6' : '#475569',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && link.icon}
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <>
                {/* Notifications link in mobile menu */}
                <button
                  onClick={() => {
                    handleNotificationsClick();
                    setIsMenuOpen(false);
                  }}
                  style={mobileButtonStyle}
                >
                  <Bell size={20} />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <span
                      style={{
                        backgroundColor: '#f97316',
                        color: '#fff',
                        fontSize: '12px',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 'auto',
                      }}
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                <Link
                  to="/cart"
                  style={mobileLinkStyle}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart size={20} />
                  <span>Cart ({cartItemsCount})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    ...mobileButtonStyle,
                    color: '#ef4444',
                  }}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!user && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    ...mobileLinkStyle,
                    padding: '10px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    ...mobileLinkStyle,
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    borderRadius: '8px',
                    justifyContent: 'center',
                    flex: 1,
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;