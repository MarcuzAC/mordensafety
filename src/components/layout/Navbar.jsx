import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { notificationsAPI } from '../../services/api';
import { ShoppingCart, User, LogOut, Menu, X, Bell, Package } from 'lucide-react';
import './Navbar.css'; // Create this CSS file

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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="navbar-logo-icon">
              MS
            </div>
            <span className="navbar-brand">
              Morden Safety
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className={`navbar-desktop-nav ${isMobile ? 'hidden' : ''}`}>
            {[...navLinks, ...authLinks].map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
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
          <div className={`navbar-desktop-auth ${isMobile ? 'hidden' : ''}`}>
            {user ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  className="navbar-icon-link"
                >
                  <ShoppingCart size={24} />
                  {cartItemsCount > 0 && (
                    <span className="navbar-cart-badge">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                <button
                  onClick={handleNotificationsClick}
                  className="navbar-icon-button"
                  title={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} new)` : ''}`}
                >
                  <Bell size={24} />
                  {unreadNotifications > 0 && (
                    <span className="navbar-notification-badge">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* User Info */}
                <div className="navbar-user-info">
                  <div className="navbar-user-avatar">
                    <User size={16} color="#3b82f6" />
                  </div>
                  <span className="navbar-user-name">
                    {isTablet ? user.full_name.split(' ')[0] : user.full_name}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="navbar-logout-button"
                >
                  <LogOut size={20} />
                  <span className={isTablet ? 'hidden' : ''}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-login-link"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="navbar-register-button"
                >
                  {isTablet ? 'Register' : 'Get Started'}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`navbar-mobile-menu-button ${isMobile ? '' : 'hidden'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="navbar-mobile-nav">
            {[...navLinks, ...authLinks].map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-mobile-link ${isActive ? 'active' : ''}`}
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
                  className="navbar-mobile-button"
                >
                  <Bell size={20} />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <span className="navbar-mobile-notification-badge">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="navbar-mobile-link"
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
                  className="navbar-mobile-logout-button"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!user && (
              <div className="navbar-mobile-auth-buttons">
                <Link
                  to="/login"
                  className="navbar-mobile-login-button"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="navbar-mobile-register-button"
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