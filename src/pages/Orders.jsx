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
        return <CheckCircle className="text-green-600" size={20} />;
      case 'shipped':
        return <Truck className="text-blue-600" size={20} />;
      case 'processing':
        return <Package className="text-purple-600" size={20} />;
      case 'pending':
        return <Clock className="text-orange-600" size={20} />;
      case 'cancelled':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-secondary-900 font-poppins">My Orders</h1>
        <p className="text-lg text-secondary-600 font-poppins">
          Track and manage all your purchases
        </p>
      </div>

      {/* Order Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-secondary-200 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-primary-600 font-poppins">{orders.length}</div>
          <div className="text-sm text-secondary-600 font-poppins mt-2">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-secondary-200 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600 font-poppins">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-secondary-600 font-poppins mt-2">Delivered</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-secondary-200 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-600 font-poppins">
            {orders.filter(o => o.status === 'shipped').length}
          </div>
          <div className="text-sm text-secondary-600 font-poppins mt-2">In Transit</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-secondary-200 hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-orange-600 font-poppins">
            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          </div>
          <div className="text-sm text-secondary-600 font-poppins mt-2">Processing</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-secondary-200 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 font-poppins ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-secondary-700 hover:bg-secondary-50 border border-secondary-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-secondary-100 text-secondary-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="text-secondary-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 font-poppins">No orders yet</h2>
          <p className="text-secondary-600 max-w-md mx-auto font-poppins">
            {activeTab === 'all'
              ? "You haven't placed any orders yet. Start shopping to see your orders here."
              : `You don't have any ${activeTab.replace('_', ' ')} orders.`}
          </p>
          {activeTab === 'all' && (
            <Link 
              to="/products" 
              className="btn-primary inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 font-poppins"
            >
              <ShoppingBag size={18} />
              <span>Browse Products</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-secondary-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-secondary-900 font-poppins">
                        Order #{order.order_number || order.id.slice(-8).toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1.5 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-poppins capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)} font-poppins`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-secondary-600">
                        <Calendar size={16} className="text-secondary-400" />
                        <span className="font-poppins">{formatDate(order.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-secondary-600">
                        <CreditCard size={16} className="text-secondary-400" />
                        <span className="font-poppins capitalize">{order.payment_method?.replace('_', ' ') || 'Cash'}</span>
                      </div>

                      {order.tracking_number && (
                        <div className="flex items-center space-x-2 text-secondary-600">
                          <Truck size={16} className="text-secondary-400" />
                          <span className="font-poppins">Tracking: <span className="font-mono">{order.tracking_number}</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-sm text-secondary-600 font-poppins">Total Amount</p>
                      <p className="text-2xl font-bold text-primary-600 font-poppins">
                        {formatCurrency(order.total_amount || 0)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors duration-200 font-medium font-poppins border border-secondary-200"
                    >
                      <Download size={16} />
                      <span>Download Invoice</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="p-6 bg-secondary-50/50 border-b border-secondary-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin size={16} className="text-secondary-500" />
                    <span className="font-medium text-secondary-700 font-poppins">Shipping Address</span>
                  </div>
                  <p className="text-secondary-600 font-poppins">{order.shipping_address}</p>
                  {order.phone && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Phone size={16} className="text-secondary-500" />
                      <span className="text-secondary-600 font-poppins">{order.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-medium text-secondary-700 mb-4 font-poppins">Order Items</h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-100 hover:bg-secondary-50/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-secondary-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-secondary-100 rounded-lg border border-secondary-200 flex items-center justify-center">
                            <Package className="text-secondary-400" size={24} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-secondary-900 font-poppins">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-secondary-600 font-poppins mt-1 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-secondary-900 font-poppins">
                          {formatCurrency(item.price || 0)} × {item.quantity || 1}
                        </p>
                        <p className="text-lg font-bold text-primary-600 font-poppins">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      {order.note && (
                        <div>
                          <p className="text-sm font-medium text-secondary-700 mb-2 font-poppins">Order Note:</p>
                          <p className="text-sm text-secondary-600 bg-secondary-50 p-4 rounded-lg border border-secondary-100 font-poppins">
                            {order.note}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full lg:w-64 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-secondary-600 font-poppins">Subtotal</span>
                        <span className="font-medium font-poppins">{formatCurrency(order.subtotal || 0)}</span>
                      </div>
                      {order.shipping_fee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-secondary-600 font-poppins">Shipping Fee</span>
                          <span className="font-medium font-poppins">{formatCurrency(order.shipping_fee || 0)}</span>
                        </div>
                      )}
                      {order.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-secondary-600 font-poppins">Discount</span>
                          <span className="font-medium text-green-600 font-poppins">-{formatCurrency(order.discount || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-secondary-200">
                        <span className="font-bold text-secondary-900 font-poppins">Total</span>
                        <span className="text-2xl font-bold text-primary-600 font-poppins">
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
    </div>
  );
};

export default Orders;