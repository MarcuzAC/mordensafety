import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { Calendar, Package, CreditCard, Truck, CheckCircle, Clock, AlertCircle, Download, MapPin, Phone } from 'lucide-react';

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
    } catch (error) {
      console.error('Error downloading invoice:', error);
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
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-secondary-900">My Orders</h1>
        <p className="text-lg text-secondary-600">
          Track and manage all your purchases
        </p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{orders.length}</div>
          <div className="text-sm text-secondary-600">Total Orders</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-secondary-600">Delivered</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'shipped').length}
          </div>
          <div className="text-sm text-secondary-600">In Transit</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          </div>
          <div className="text-sm text-secondary-600">Processing</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-secondary-200 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-white text-primary-600' : 'bg-secondary-300 text-secondary-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
            <Package className="text-secondary-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">No orders yet</h2>
          <p className="text-secondary-600 max-w-md mx-auto">
            {activeTab === 'all'
              ? "You haven't placed any orders yet. Start shopping to see your orders here."
              : `You don't have any ${activeTab.replace('_', ' ')} orders.`}
          </p>
          {activeTab === 'all' && (
            <a href="/products" className="btn-primary inline-block">
              Browse Products
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-secondary-900">
                      Order #{order.order_number || order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <Calendar size={16} />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <CreditCard size={16} />
                      <span>{order.payment_method?.replace('_', ' ') || 'Cash'}</span>
                    </div>

                    {order.tracking_number && (
                      <div className="flex items-center space-x-2 text-secondary-600">
                        <Truck size={16} />
                        <span>Tracking: {order.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <p className="text-sm text-secondary-600">Total Amount</p>
                    <p className="text-2xl font-bold text-primary-600">
                      MK {order.total_amount?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mb-4 p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin size={16} className="text-secondary-500" />
                    <span className="font-medium text-secondary-700">Shipping Address</span>
                  </div>
                  <p className="text-secondary-600">{order.shipping_address}</p>
                  {order.phone && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Phone size={16} className="text-secondary-500" />
                      <span className="text-secondary-600">{order.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="border-t border-secondary-200 pt-4">
                <h4 className="font-medium text-secondary-700 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-secondary-200">
                      <div className="flex items-center space-x-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-medium text-secondary-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-secondary-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-secondary-900">
                          MK {item.price?.toLocaleString() || '0.00'} × {item.quantity || 1}
                        </p>
                        <p className="text-lg font-bold text-primary-600">
                          MK {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-secondary-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    {order.note && (
                      <div>
                        <p className="text-sm font-medium text-secondary-700 mb-1">Order Note:</p>
                        <p className="text-sm text-secondary-600 bg-secondary-50 p-3 rounded-lg">
                          {order.note}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="flex justify-between space-x-8">
                      <span className="text-secondary-600">Subtotal</span>
                      <span className="font-medium">MK {order.subtotal?.toLocaleString() || '0.00'}</span>
                    </div>
                    {order.shipping_fee > 0 && (
                      <div className="flex justify-between space-x-8">
                        <span className="text-secondary-600">Shipping Fee</span>
                        <span className="font-medium">MK {order.shipping_fee?.toLocaleString() || '0.00'}</span>
                      </div>
                    )}
                    <div className="flex justify-between space-x-8 border-t border-secondary-200 pt-2">
                      <span className="font-bold text-secondary-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        MK {order.total_amount?.toLocaleString() || '0.00'}
                      </span>
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