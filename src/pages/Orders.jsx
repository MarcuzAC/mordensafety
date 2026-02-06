import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { Calendar, Package, CreditCard, Truck, CheckCircle, Clock, AlertCircle, Download, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, processing, shipped, delivered

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      // Filter orders based on active tab
      const filteredOrders = activeTab === 'all' 
        ? response.data.orders 
        : response.data.orders.filter(order => order.status === activeTab);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} color="#10b981" />;
      case 'shipped':
        return <Truck size={20} color="#3b82f6" />;
      case 'processing':
        return <Package size={20} color="#8b5cf6" />;
      case 'pending':
        return <Clock size={20} color="#f97316" />;
      case 'cancelled':
        return <AlertCircle size={20} color="#ef4444" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return { background: '#d1fae5', color: '#065f46' };
      case 'shipped':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'processing':
        return { background: '#f3e8ff', color: '#6d28d9' };
      case 'pending':
        return { background: '#ffedd5', color: '#9a3412' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return { background: '#d1fae5', color: '#065f46' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'failed':
        return { background: '#fee2e2', color: '#991b1b' };
      case 'refunded':
        return { background: '#dbeafe', color: '#1e40af' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await ordersAPI.generateInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Show success message
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Invoice downloaded successfully!',
          type: 'success'
        }
      }));
    } catch (error) {
      console.error('Error downloading invoice:', error);
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          message: 'Failed to download invoice. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('MWK', 'MK');
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
  ];

  // Base styles
  const containerStyle = {
    fontFamily: "'Poppins', sans-serif",
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '40px',
  };

  const headerTitleStyle = {
    fontSize: '36px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '12px',
  };

  const headerSubtitleStyle = {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: 400,
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  };

  const statCardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  };

  const statCardHoverStyle = {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transform: 'translateY(-2px)',
  };

  const statValueStyle = {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '8px',
  };

  const statLabelStyle = {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: 500,
  };

  const tabsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
    marginBottom: '24px',
  };

  const tabButtonStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    background: isActive ? '#3b82f6' : '#ffffff',
    color: isActive ? '#ffffff' : '#334155',
    boxShadow: isActive ? '0 1px 3px 0 rgba(59, 130, 246, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    border: `1px solid ${isActive ? '#3b82f6' : '#e2e8f0'}`,
  });

  const tabBadgeStyle = (isActive) => ({
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
    color: isActive ? '#ffffff' : '#334155',
  });

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '64px 20px',
  };

  const emptyIconStyle = {
    width: '96px',
    height: '96px',
    background: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  };

  const emptyTitleStyle = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '12px',
  };

  const emptyTextStyle = {
    fontSize: '16px',
    color: '#64748b',
    maxWidth: '400px',
    margin: '0 auto 24px',
    lineHeight: '1.6',
  };

  const browseButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '16px',
    color: '#ffffff',
    background: '#3b82f6',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', sans-serif",
  };

  const browseButtonHoverStyle = {
    background: '#2563eb',
    transform: 'translateY(-1px)',
  };

  const orderCardStyle = {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  const orderCardHoverStyle = {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  const orderHeaderStyle = {
    padding: '24px',
    borderBottom: '1px solid #f1f5f9',
  };

  const orderTitleStyle = {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '16px',
  };

  const statusBadgeStyle = (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 500,
    ...color,
  });

  const dateInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '4px',
  };

  const amountStyle = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3b82f6',
  };

  const downloadButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '6px',
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Poppins', sans-serif",
  };

  const downloadButtonHoverStyle = {
    background: '#f1f5f9',
  };

  const addressSectionStyle = {
    padding: '20px 24px',
    background: 'rgba(241, 245, 249, 0.5)',
    borderBottom: '1px solid #f1f5f9',
  };

  const addressTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '8px',
    fontSize: '14px',
  };

  const addressTextStyle = {
    color: '#475569',
    fontSize: '14px',
    lineHeight: '1.5',
  };

  const itemsSectionStyle = {
    padding: '24px',
  };

  const itemsTitleStyle = {
    fontWeight: 500,
    color: '#334155',
    marginBottom: '16px',
    fontSize: '16px',
  };

  const itemCardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    marginBottom: '12px',
    transition: 'all 0.2s ease',
  };

  const itemCardHoverStyle = {
    background: 'rgba(241, 245, 249, 0.5)',
  };

  const itemImageStyle = {
    width: '64px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  };

  const itemImagePlaceholderStyle = {
    width: '64px',
    height: '64px',
    background: '#f1f5f9',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const itemNameStyle = {
    fontWeight: 500,
    color: '#1e293b',
    fontSize: '16px',
  };

  const itemDescriptionStyle = {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
  };

  const itemPriceStyle = {
    fontWeight: 500,
    color: '#1e293b',
    fontSize: '14px',
  };

  const itemTotalStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#3b82f6',
    marginTop: '4px',
  };

  const summarySectionStyle = {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
  };

  const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  };

  const summaryLabelStyle = {
    color: '#64748b',
  };

  const summaryValueStyle = {
    fontWeight: 500,
  };

  const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
    marginTop: '16px',
  };

  const totalLabelStyle = {
    fontWeight: 700,
    color: '#1e293b',
    fontSize: '18px',
  };

  const totalValueStyle = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3b82f6',
  };

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '256px',
  };

  const spinnerStyle = {
    width: '48px',
    height: '48px',
    border: '3px solid #f3f4f6',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div style={headerStyle}>
        <h1 style={headerTitleStyle}>My Orders</h1>
        <p style={headerSubtitleStyle}>Track and manage all your purchases</p>
      </div>

      {/* Order Stats Cards */}
      <div style={statsGridStyle}>
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, statCardStyle)}
        >
          <div style={{...statValueStyle, color: '#3b82f6'}}>{orders.length}</div>
          <div style={statLabelStyle}>Total Orders</div>
        </div>
        
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, statCardStyle)}
        >
          <div style={{...statValueStyle, color: '#10b981'}}>
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div style={statLabelStyle}>Delivered</div>
        </div>
        
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, statCardStyle)}
        >
          <div style={{...statValueStyle, color: '#3b82f6'}}>
            {orders.filter(o => o.status === 'shipped').length}
          </div>
          <div style={statLabelStyle}>In Transit</div>
        </div>
        
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, statCardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, statCardStyle)}
        >
          <div style={{...statValueStyle, color: '#f97316'}}>
            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          </div>
          <div style={statLabelStyle}>Processing</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={tabsContainerStyle}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={tabButtonStyle(isActive)}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#334155';
                }
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={tabBadgeStyle(isActive)}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <ShoppingBag size={40} color="#94a3b8" />
          </div>
          <h2 style={emptyTitleStyle}>No orders yet</h2>
          <p style={emptyTextStyle}>
            {activeTab === 'all'
              ? "You haven't placed any orders yet. Start shopping to see your orders here."
              : `You don't have any ${activeTab.replace('_', ' ')} orders.`}
          </p>
          {activeTab === 'all' && (
            <Link 
              to="/products" 
              style={browseButtonStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, browseButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, browseButtonStyle)}
            >
              <ShoppingBag size={18} />
              <span>Browse Products</span>
            </Link>
          )}
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div 
              key={order.id} 
              style={orderCardStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, orderCardHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, orderCardStyle)}
            >
              {/* Order Header */}
              <div style={orderHeaderStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                    <h3 style={orderTitleStyle}>
                      Order #{order.order_number || order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span style={statusBadgeStyle(getStatusColor(order.status))}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.replace('_', ' ')}</span>
                    </span>
                    <span style={statusBadgeStyle(getPaymentStatusColor(order.payment_status))}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={dateInfoStyle}>
                      <Calendar size={16} color="#94a3b8" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    
                    <div style={dateInfoStyle}>
                      <CreditCard size={16} color="#94a3b8" />
                      <span>{order.payment_method?.replace('_', ' ') || 'Cash'}</span>
                    </div>

                    {order.tracking_number && (
                      <div style={dateInfoStyle}>
                        <Truck size={16} color="#94a3b8" />
                        <span>Tracking: <span style={{ fontFamily: 'monospace' }}>{order.tracking_number}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Amount</p>
                    <p style={amountStyle}>
                      {formatCurrency(order.total_amount || 0)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadInvoice(order.id)}
                    style={downloadButtonStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, downloadButtonHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, downloadButtonStyle)}
                  >
                    <Download size={16} />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div style={addressSectionStyle}>
                  <div style={addressTitleStyle}>
                    <MapPin size={16} color="#64748b" />
                    <span>Shipping Address</span>
                  </div>
                  <p style={addressTextStyle}>{order.shipping_address}</p>
                  {order.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <Phone size={16} color="#64748b" />
                      <span style={addressTextStyle}>{order.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div style={itemsSectionStyle}>
                <h4 style={itemsTitleStyle}>Order Items</h4>
                <div>
                  {order.items?.map((item, index) => (
                    <div 
                      key={index} 
                      style={itemCardStyle}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, itemCardHoverStyle)}
                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, itemCardStyle)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={itemImageStyle}
                          />
                        ) : (
                          <div style={itemImagePlaceholderStyle}>
                            <Package size={24} color="#94a3b8" />
                          </div>
                        )}
                        <div>
                          <p style={itemNameStyle}>{item.name}</p>
                          {item.description && (
                            <p style={itemDescriptionStyle}>{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={itemPriceStyle}>
                          {formatCurrency(item.price || 0)} × {item.quantity || 1}
                        </p>
                        <p style={itemTotalStyle}>
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div style={summarySectionStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {order.note && (
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '8px' }}>
                          Order Note:
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#475569',
                          background: '#f8fafc',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          lineHeight: '1.5',
                        }}>
                          {order.note}
                        </p>
                      </div>
                    )}
                    
                    <div style={{ maxWidth: '300px', marginLeft: 'auto' }}>
                      <div style={summaryRowStyle}>
                        <span style={summaryLabelStyle}>Subtotal</span>
                        <span style={summaryValueStyle}>{formatCurrency(order.subtotal || 0)}</span>
                      </div>
                      {order.shipping_fee > 0 && (
                        <div style={summaryRowStyle}>
                          <span style={summaryLabelStyle}>Shipping Fee</span>
                          <span style={summaryValueStyle}>{formatCurrency(order.shipping_fee || 0)}</span>
                        </div>
                      )}
                      {order.discount > 0 && (
                        <div style={summaryRowStyle}>
                          <span style={summaryLabelStyle}>Discount</span>
                          <span style={{ ...summaryValueStyle, color: '#10b981' }}>
                            -{formatCurrency(order.discount || 0)}
                          </span>
                        </div>
                      )}
                      <div style={totalRowStyle}>
                        <span style={totalLabelStyle}>Total</span>
                        <span style={totalValueStyle}>
                          {formatCurrency(order.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        `}
      </style>
    </div>
  );
};

export default Orders;