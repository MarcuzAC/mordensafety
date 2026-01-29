import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { notificationsAPI } from '../../services/api';
import { ShoppingCart, User, LogOut, Menu, X, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout, cartItemsCount } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
  ];

  const authLinks = user
    ? [
        { path: '/service-request', label: 'Request Service' },
        { path: '/my-requests', label: 'My Requests' },
        { path: '/notifications', label: 'Notifications' },
      ]
    : [];

  const baseLinkStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    padding: '6px 10px',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  const buttonStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
  };

  // Handle notification bell click
  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  return (
    <nav
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '700',
                fontSize: '16px',
              }}
            >
              MS
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#1e3c72' }}>Morden Safety</span>
          </Link>

          {/* Desktop Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexGrow: 1,
              justifyContent: 'center',
            }}
          >
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
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.target.style.color = '#1e40af';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.target.style.color = '#475569';
                  }}
                >
                  {link.label}
                  {link.path === '/notifications' && unreadNotifications > 0 && (
                    <span
                      style={{
                        marginLeft: '6px',
                        backgroundColor: '#f97316',
                        color: '#fff',
                        fontSize: '12px',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <>
                {/* Cart */}
                <Link
                  to="/cart"
                  style={{
                    position: 'relative',
                    padding: '8px',
                    color: '#475569',
                    transition: 'color 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  <ShoppingCart size={24} />
                  {cartItemsCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        fontSize: '12px',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell (Optional - if you want both link and bell) */}
                <button
                  onClick={handleNotificationsClick}
                  style={{
                    position: 'relative',
                    padding: '8px',
                    color: '#475569',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                  title="View notifications"
                >
                  <Bell size={24} />
                  {unreadNotifications > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#f97316',
                        color: '#fff',
                        fontSize: '12px',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={16} color="#3b82f6" />
                  </div>
                  <span style={{ color: '#475569', fontWeight: 500 }}>{user.full_name}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#475569',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
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
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            style={{
              padding: '8px',
              display: 'flex',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#1e3c72',
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            style={{
              padding: '16px 0',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {[...navLinks, ...authLinks].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  color: location.pathname === link.path ? '#3b82f6' : '#475569',
                  textDecoration: 'none',
                  padding: '8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
                {link.path === '/notifications' && unreadNotifications > 0 && (
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
                    }}
                  >
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/cart"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#475569',
                    textDecoration: 'none',
                  }}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;