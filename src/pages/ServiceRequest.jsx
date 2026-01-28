import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { requestsAPI } from '../services/api';
import { MapPin, MessageSquare, ShoppingCart, CheckCircle, User, Mail, Phone } from 'lucide-react';

const ServiceRequest = () => {
  const { cart, clearCart, user } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service_type: 'installation',
    extinguisher_type: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceTypes = [
    { value: 'installation', label: 'Installation' },
    { value: 'refill', label: 'Refill' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
  ];

  const extinguisherTypes = [
    { value: '', label: 'Select extinguisher type' },
    { value: 'abc_powder', label: 'ABC Powder' },
    { value: 'co2', label: 'CO2' },
    { value: 'water', label: 'Water' },
    { value: 'foam', label: 'Foam' },
    { value: 'wet_chemical', label: 'Wet Chemical' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        quantity: cart.reduce((total, item) => total + item.quantity, 0),
        cart_items: cart
      };

      await requestsAPI.createRequest(requestData);
      setSuccess(true);
      clearCart();
      
      // Notify admin (this happens automatically in the backend)
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Failed to create service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
    letterSpacing: '-0.025em',
  };

  const subtitleStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s ease',
  };

  const cardHoverStyle = {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
    borderColor: '#dbeafe',
  };

  const formTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  const selectStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const selectFocusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  const textareaStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.3s ease',
    minHeight: '80px',
  };

  const textareaFocusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const submitButtonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  };

  const submitButtonDisabledStyle = {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none',
  };

  const cartHeaderStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const emptyCartStyle = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#9ca3af',
  };

  const cartItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const cartItemImageStyle = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginRight: '16px',
  };

  const cartItemInfoStyle = {
    flex: '1',
  };

  const cartItemNameStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  };

  const cartItemQtyStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
  };

  const cartItemPriceStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1e40af',
  };

  const totalContainerStyle = {
    borderTop: '2px solid #f3f4f6',
    paddingTop: '20px',
    marginTop: '20px',
  };

  const totalStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#1e40af',
  };

  const customerCardStyle = {
    ...cardStyle,
    backgroundColor: '#f8fafc',
  };

  const customerTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const customerInfoStyle = {
    display: 'grid',
    gap: '12px',
  };

  const customerItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: '#4b5563',
  };

  const customerLabelStyle = {
    fontWeight: '600',
    color: '#374151',
  };

  const successContainerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '60px 20px',
  };

  const successIconContainerStyle = {
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 32px',
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)',
  };

  const successTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '16px',
  };

  const successMessageStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '40px',
  };

  const successButtonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '300px',
    margin: '0 auto',
  };

  const successButtonStyle = {
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const successPrimaryButtonStyle = {
    ...successButtonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
  };

  const successPrimaryButtonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  };

  const successSecondaryButtonStyle = {
    ...successButtonStyle,
    backgroundColor: 'white',
    color: '#4b5563',
    border: '2px solid #e5e7eb',
  };

  const successSecondaryButtonHoverStyle = {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  };

  const loadingSpinnerStyle = {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={successContainerStyle}>
          <div style={successIconContainerStyle}>
            <CheckCircle size={48} color="white" />
          </div>
          
          <h1 style={successTitleStyle}>
            Service Request Submitted!
          </h1>
          <p style={successMessageStyle}>
            Thank you for your service request. Our team has been notified and will contact you shortly to schedule the service.
          </p>

          <div style={successButtonContainerStyle}>
            <button
              onClick={() => navigate('/my-requests')}
              style={successPrimaryButtonStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, successPrimaryButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, successPrimaryButtonStyle)}
            >
              View My Requests
            </button>
            <button
              onClick={() => navigate('/products')}
              style={successSecondaryButtonStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, successSecondaryButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, successSecondaryButtonStyle)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Request Service</h1>
        <p style={subtitleStyle}>
          Complete your service request with the items in your cart
        </p>
      </div>

      {/* Main Content Grid */}
      <div style={gridStyle}>
        {/* Service Request Form */}
        <div style={cardStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
        >
          <h2 style={formTitleStyle}>Service Details</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={labelStyle}>
                Service Type
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                style={selectStyle}
                onFocus={(e) => Object.assign(e.target.style, selectFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, selectStyle)}
                required
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Extinguisher Type
              </label>
              <select
                name="extinguisher_type"
                value={formData.extinguisher_type}
                onChange={handleChange}
                style={selectStyle}
                onFocus={(e) => Object.assign(e.target.style, selectFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, selectStyle)}
              >
                {extinguisherTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                Service Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={textareaStyle}
                onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
                placeholder="Enter the address where service is needed"
                required
              />
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={16} />
                Additional Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={textareaStyle}
                onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
                placeholder="Any special requirements or additional information..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              style={{
                ...submitButtonStyle,
                ...(loading || cart.length === 0 ? submitButtonDisabledStyle : {})
              }}
              onMouseEnter={(e) => {
                if (!loading && cart.length > 0) {
                  Object.assign(e.currentTarget.style, submitButtonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, {
                  ...submitButtonStyle,
                  ...(loading || cart.length === 0 ? submitButtonDisabledStyle : {})
                });
              }}
            >
              {loading ? (
                <div style={loadingSpinnerStyle} />
              ) : (
                'Submit Service Request'
              )}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Summary */}
          <div style={cardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
          >
            <h3 style={cartHeaderStyle}>
              <ShoppingCart size={22} />
              Order Summary
            </h3>
            
            {cart.length === 0 ? (
              <div style={emptyCartStyle}>
                Your cart is empty. Add products to proceed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={cartItemStyle}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {item.image_url && (
                        <img
                          src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`}
                          alt={item.name}
                          style={cartItemImageStyle}
                        />
                      )}
                      <div style={cartItemInfoStyle}>
                        <p style={cartItemNameStyle}>{item.name}</p>
                        <p style={cartItemQtyStyle}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p style={cartItemPriceStyle}>
                      MK {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
                
                <div style={totalContainerStyle}>
                  <div style={totalStyle}>
                    <span>Total</span>
                    <span className="text-primary-600">
                      MK {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div style={customerCardStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, customerCardStyle)}
          >
            <h3 style={customerTitleStyle}>Customer Information</h3>
            <div style={customerInfoStyle}>
              <div style={customerItemStyle}>
                <User size={18} color="#4b5563" />
                <span><span style={customerLabelStyle}>Name:</span> {user.full_name}</span>
              </div>
              <div style={customerItemStyle}>
                <Mail size={18} color="#4b5563" />
                <span><span style={customerLabelStyle}>Email:</span> {user.email}</span>
              </div>
              <div style={customerItemStyle}>
                <Phone size={18} color="#4b5563" />
                <span><span style={customerLabelStyle}>Phone:</span> {user.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (min-width: 1024px) {
            .grid-lg {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ServiceRequest;