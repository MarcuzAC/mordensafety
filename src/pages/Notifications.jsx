import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { notificationsAPI, showToast } from '../services/api';
import {
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Wrench,
  Package,
  ChevronRight,
  Filter,
  Trash2,
  DollarSign,
  Truck
} from 'lucide-react';

const Notifications = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Debug state
  const [debugInfo, setDebugInfo] = useState('');

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setDebugInfo('No user found');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    setDebugInfo('Fetching notifications...');
    
    try {
      console.log('🔔 Fetching notifications for user:', user.email);
      const response = await notificationsAPI.getNotifications();
      console.log('🔔 API Response:', response);
      
      // Handle different response formats
      const notificationsData = response.data?.notifications || response.data || [];
      setDebugInfo(`Received ${notificationsData.length} notifications`);
      
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setDebugInfo(`Error: ${error.message}`);
      setError('Failed to load notifications. Please try again.');
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notifications on component mount and user change
  useEffect(() => {
    console.log('🔔 Notifications component mounted, user:', user?.email);
    fetchNotifications();
    
    // Set up interval to refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (!notification) return false;
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  // Mark notification as read
  const markAsRead = async (notificationId, markAll = false) => {
    try {
      if (markAll) {
        // Mark all as read
        const unreadNotifications = notifications.filter(n => n && !n.is_read);
        await Promise.all(unreadNotifications.map(n => 
          notificationsAPI.markAsRead(n.id)
        ));
        setNotifications(prev => prev.map(n => n ? { ...n, is_read: true } : n));
        showToast('All notifications marked as read', 'success');
      } else {
        await notificationsAPI.markAsRead(notificationId);
        setNotifications(prev => 
          prev.map(n => n && n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Failed to update notification', 'error');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, deleteAll = false) => {
    try {
      if (deleteAll) {
        setNotifications([]);
        showToast('All notifications cleared', 'success');
      } else {
        setNotifications(prev => prev.filter(n => n && n.id !== notificationId));
        showToast('Notification removed', 'success');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  };

  // Determine notification type based on title and message
  const getNotificationType = (notification) => {
    if (!notification) return 'info';
    
    const title = notification.title?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';
    
    if (title.includes('payment') || message.includes('payment')) {
      return 'payment';
    } else if (title.includes('request') || message.includes('request')) {
      return 'service';
    } else if (title.includes('order') || message.includes('order')) {
      return 'order';
    } else if (title.includes('delivery') || message.includes('delivery') || title.includes('shipped')) {
      return 'delivery';
    } else if (message.includes('completed') || message.includes('success')) {
      return 'success';
    } else if (message.includes('warning') || message.includes('pending')) {
      return 'warning';
    } else if (message.includes('error') || message.includes('failed')) {
      return 'error';
    } else {
      return 'info';
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    const type = getNotificationType(notification);
    
    switch(type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'info':
        return <Info size={20} color="#3b82f6" />;
      case 'order':
        return <ShoppingBag size={20} color="#8b5cf6" />;
      case 'service':
        return <Wrench size={20} color="#06b6d4" />;
      case 'delivery':
        return <Truck size={20} color="#ec4899" />;
      case 'payment':
        return <DollarSign size={20} color="#10b981" />;
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (notification) => {
    const type = getNotificationType(notification);
    
    switch(type) {
      case 'success':
        return { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46' };
      case 'warning':
        return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
      case 'error':
        return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' };
      case 'info':
        return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' };
      case 'order':
        return { bg: '#f3e8ff', border: '#e9d5ff', text: '#6b21a8' };
      case 'service':
        return { bg: '#cffafe', border: '#a5f3fc', text: '#155e75' };
      case 'delivery':
        return { bg: '#fce7f3', border: '#fbcfe8', text: '#9d174d' };
      case 'payment':
        return { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46' };
      default:
        return { bg: '#f3f4f6', border: '#e5e7eb', text: '#374151' };
    }
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  // Extract reference number from message
  const extractReference = (message) => {
    if (!message) return null;
    const regex = /#(\w+)/;
    const match = message.match(regex);
    return match ? match[1] : null;
  };

  // Get notification action
  const getAction = (notification) => {
    if (!notification) return null;
    
    if (notification.request_id) {
      return {
        type: 'view_request',
        text: 'View Request',
        url: `/my-requests`
      };
    } else if (notification.order_id) {
      return {
        type: 'view_order',
        text: 'View Order',
        url: `/my-orders`
      };
    }
    return null;
  };

  // Handle notification action
  const handleAction = (notification) => {
    const action = getAction(notification);
    if (action && action.url) {
      navigate(action.url);
    }
    if (notification && !notification.is_read) {
      markAsRead(notification.id);
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: 'calc(100vh - 80px)'
  };

  const headerStyle = {
    marginBottom: '40px',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '12px',
    letterSpacing: '-0.025em',
  };

  const subtitleStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const filtersContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
  };

  const filterButtonsStyle = {
    display: 'flex',
    gap: '12px',
  };

  const filterButtonStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    background: active ? '#3b82f6' : '#f3f4f6',
    color: active ? 'white' : '#6b7280',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const actionButtonsStyle = {
    display: 'flex',
    gap: '12px',
  };

  const actionButtonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: 'white',
    color: '#6b7280',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
  };

  const emptyIconStyle = {
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const emptyTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px',
  };

  const emptyTextStyle = {
    fontSize: '1rem',
    color: '#6b7280',
    maxWidth: '400px',
    margin: '0 auto 24px',
    lineHeight: '1.6',
  };

  const notificationCardStyle = (isUnread, colors) => ({
    background: isUnread ? '#ffffff' : colors.bg,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '12px',
    border: `2px solid ${isUnread ? '#dbeafe' : colors.border}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: isUnread ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
  });

  const notificationHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const notificationTitleStyle = (colors) => ({
    fontSize: '1rem',
    fontWeight: '700',
    color: colors.text,
    margin: 0,
  });

  const notificationTimeStyle = {
    fontSize: '0.75rem',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const notificationMessageStyle = {
    fontSize: '0.95rem',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '8px',
  };

  const notificationReferenceStyle = {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: '16px',
  };

  const notificationActionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(229, 231, 235, 0.5)',
  };

  const actionBtnStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#3b82f6',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const deleteButtonStyle = {
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const readIndicatorStyle = (isUnread) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isUnread ? '#3b82f6' : 'transparent',
    position: 'absolute',
    left: '-16px',
    top: '50%',
    transform: 'translateY(-50%)',
  });

  const loadingContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  };

  const loadingSpinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const statusBadgeStyle = (message) => {
    if (!message) return { display: 'none' };
    
    const isCompleted = message.includes('COMPLETED');
    const isInProgress = message.includes('IN_PROGRESS');
    const isPaid = message.includes('PAID');
    
    let bgColor = '#6b7280';
    if (isCompleted) bgColor = '#10b981';
    if (isInProgress) bgColor = '#f59e0b';
    if (isPaid) bgColor = '#10b981';
    
    return {
      background: bgColor,
      color: 'white',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-block',
      marginLeft: '8px',
    };
  };

  const errorAlertStyle = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  // Handle user not logged in
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <AlertCircle size={40} color="#ef4444" />
          </div>
          <h2 style={emptyTitleStyle}>Please Login</h2>
          <p style={emptyTextStyle}>
            You need to be logged in to view notifications.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingContainerStyle}>
          <div style={loadingSpinnerStyle} />
        </div>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorAlertStyle}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
        <button
          onClick={fetchNotifications}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n && !n.is_read).length;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Notifications</h1>
        <p style={subtitleStyle}>
          Stay updated with your orders, services, and important alerts
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginLeft: '12px'
            }}>
              {unreadCount} new
            </span>
          )}
        </p>
      </div>

      {/* Filters and Actions */}
      <div style={filtersContainerStyle}>
        <div style={filterButtonsStyle}>
          <button
            onClick={() => setFilter('all')}
            style={filterButtonStyle(filter === 'all')}
          >
            <Filter size={16} style={{ marginRight: '6px' }} />
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={filterButtonStyle(filter === 'unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            style={filterButtonStyle(filter === 'read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        <div style={actionButtonsStyle}>
          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead(null, true)}
              style={actionButtonStyle}
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => deleteNotification(null, true)}
              style={{ ...actionButtonStyle, color: '#ef4444' }}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <Bell size={40} color="#3b82f6" />
          </div>
          <h2 style={emptyTitleStyle}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h2>
          <p style={emptyTextStyle}>
            {filter === 'unread' 
              ? 'You\'re all caught up! Check back later for new updates.'
              : 'You\'ll see notifications here for orders, services, and important updates.'
            }
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '20px' }}>
          {filteredNotifications.map((notification) => {
            if (!notification) return null;
            
            const isUnread = !notification.is_read;
            const colors = getNotificationColor(notification);
            const action = getAction(notification);
            const reference = extractReference(notification.message);
            
            return (
              <div 
                key={notification.id} 
                style={notificationCardStyle(isUnread, colors)}
                onClick={() => setExpandedId(expandedId === notification.id ? null : notification.id)}
              >
                {/* Unread indicator */}
                <div style={readIndicatorStyle(isUnread)} />
                
                {/* Header */}
                <div style={notificationHeaderStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getNotificationIcon(notification)}
                    <h3 style={notificationTitleStyle(colors)}>
                      {notification.title || 'Notification'}
                    </h3>
                  </div>
                  <div style={notificationTimeStyle}>
                    <Clock size={12} />
                    {formatTime(notification.created_at)}
                  </div>
                </div>

                {/* Message */}
                <div style={notificationMessageStyle}>
                  {notification.message ? notification.message.replace(/ServiceStatus\.|PaymentStatus\./g, '') : 'No message'}
                  <span style={statusBadgeStyle(notification.message)}>
                    {notification.message?.includes('COMPLETED') ? 'Completed' : 
                     notification.message?.includes('IN_PROGRESS') ? 'In Progress' : 
                     notification.message?.includes('PAID') ? 'Paid' : 'Updated'}
                  </span>
                </div>

                {/* Reference */}
                {reference && (
                  <div style={notificationReferenceStyle}>
                    Reference: <strong>#{reference}</strong>
                  </div>
                )}

                {/* Actions */}
                <div style={notificationActionsStyle}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {action && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(notification);
                        }}
                        style={actionBtnStyle}
                      >
                        {action.text}
                        <ChevronRight size={14} />
                      </button>
                    )}
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        style={{ ...actionBtnStyle, background: '#10b981' }}
                      >
                        <Check size={14} />
                        Mark as read
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    style={deleteButtonStyle}
                    title="Remove notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280',
          fontFamily: 'monospace',
        }}>
          Debug: {debugInfo}
        </div>
      )}

      {/* Tips */}
      {notifications.length > 0 && (
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Tips:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Click on any notification to expand/collapse details</li>
            <li>Click "View Request" or "View Order" to see full details</li>
            <li>Mark notifications as read to keep track of what you've seen</li>
            <li>Notifications refresh automatically every 2 minutes</li>
          </ul>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          button:hover {
            transform: translateY(-1px);
          }
          
          button:active {
            transform: translateY(0);
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 20px 16px;
            }
            
            .title {
              font-size: 2rem;
            }
            
            .filters-container {
              flex-direction: column;
              gap: 16px;
            }
            
            .filter-buttons {
              width: 100%;
              justify-content: center;
            }
            
            .action-buttons {
              width: 100%;
              justify-content: center;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Notifications;