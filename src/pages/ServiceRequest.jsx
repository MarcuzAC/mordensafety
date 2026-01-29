import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { requestsAPI } from '../services/api';
import { 
  MapPin, MessageSquare, CheckCircle, 
  User, Mail, Phone, Wrench, Package, 
  Calendar, AlertTriangle, CheckSquare,
  Home, Clock, Shield, Hash
} from 'lucide-react';

const ServiceRequest = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service_type: 'refill',
    extinguisher_type: '',
    quantity: 1,
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');

  const serviceTypes = [
    { value: 'refill', label: 'Refill/Recharge', icon: 'package', desc: 'Refill fire extinguishers' },
    { value: 'installation', label: 'Installation', icon: 'home', desc: 'New equipment installation' },
    { value: 'maintenance', label: 'Maintenance', icon: 'wrench', desc: 'Routine maintenance service' },
    { value: 'inspection', label: 'Inspection', icon: 'check-square', desc: 'Regular safety equipment check' },
    { value: 'repair', label: 'Repair', icon: 'alert-triangle', desc: 'Equipment repair service' },
    { value: 'training', label: 'Training', icon: 'shield', desc: 'Fire safety training' },
  ];

  const extinguisherTypes = [
    { value: '', label: 'Select extinguisher type' },
    { value: 'CO2', label: 'CO2' },
    { value: 'ABC Powder', label: 'ABC Powder' },
    { value: 'Water', label: 'Water' },
    { value: 'Foam', label: 'Foam' },
    { value: 'Wet Chemical', label: 'Wet Chemical' },
    { value: 'Clean Agent', label: 'Clean Agent' },
    { value: 'Water Mist', label: 'Water Mist' },
  ];

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 1 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.service_type || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        service_type: formData.service_type,
        extinguisher_type: formData.extinguisher_type || null,
        quantity: formData.quantity,
        address: formData.address,
        description: formData.description || ''
      };

      const response = await requestsAPI.createRequest(requestData);
      
      if (response.data.success && response.data.request) {
        setSuccess(true);
        setRequestNumber(response.data.request.request_number || response.data.request.id);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Error creating service request:', error);
      alert(error.response?.data?.detail || 'Failed to create service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: 'calc(100vh - 80px)'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const titleStyle = {
    fontSize: '2.5rem',
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

  const requiredLabelStyle = {
    ...labelStyle,
    position: 'relative',
  };

  const requiredStarStyle = {
    color: '#dc2626',
    marginLeft: '4px',
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
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '20px',
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

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.3s ease',
  };

  const inputFocusStyle = {
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
    marginTop: '10px',
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

  const loadingSpinnerStyle = {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
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
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '16px',
  };

  const successMessageStyle = {
    fontSize: '1.125rem',
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '24px',
  };

  const requestIdStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e40af',
    background: '#eff6ff',
    padding: '12px 20px',
    borderRadius: '12px',
    margin: '20px 0',
    display: 'inline-block',
  };

  const infoBoxStyle = {
    background: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '30px',
    textAlign: 'left',
    border: '1px solid #e5e7eb',
  };

  const infoTitleStyle = {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const infoListStyle = {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: '1.6',
    paddingLeft: '20px',
  };

  const successButtonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '300px',
    margin: '30px auto 0',
  };

  const successPrimaryButtonStyle = {
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
  };

  const successPrimaryButtonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
  };

  const successSecondaryButtonStyle = {
    padding: '16px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    color: '#4b5563',
    border: '2px solid #e5e7eb',
  };

  const successSecondaryButtonHoverStyle = {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  };

  const formHintStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '6px',
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
            Thank you for your service request. Our team will contact you within 24 hours to discuss the details and provide a quote.
          </p>

          <div style={requestIdStyle}>
            <Hash size={18} style={{ marginRight: '8px' }} />
            Request ID: {requestNumber}
          </div>

          <div style={infoBoxStyle}>
            <div style={infoTitleStyle}>
              <Clock size={18} />
              What happens next?
            </div>
            <ul style={infoListStyle}>
              <li>You'll receive a confirmation email with your request details</li>
              <li>Our technical team will review your request</li>
              <li>We'll contact you to discuss timing and pricing</li>
              <li>Once approved, we'll schedule the service</li>
              <li>After completion, you'll receive a service report</li>
            </ul>
          </div>

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
              Browse Products
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
          Need service for your fire safety equipment? Fill out this form and our certified technicians will contact you.
        </p>
      </div>

      {/* Main Form Card */}
      <div style={cardStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
      >
        <h2 style={formTitleStyle}>
          <Wrench size={24} />
          Service Request Form
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Service Type */}
          <div>
            <label style={requiredLabelStyle}>
              Type of Service<span style={requiredStarStyle}>*</span>
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
            <div style={formHintStyle}>
              {serviceTypes.find(t => t.value === formData.service_type)?.desc}
            </div>
          </div>

          {/* Extinguisher Type */}
          <div>
            <label style={labelStyle}>
              Extinguisher Type (If applicable)
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

          {/* Quantity */}
          <div>
            <label style={labelStyle}>
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max="100"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
            <div style={formHintStyle}>
              Number of units needing service
            </div>
          </div>

          {/* Service Address */}
          <div>
            <label style={{ ...requiredLabelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} />
              Service Address<span style={requiredStarStyle}>*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
              placeholder="Enter the complete address where service is needed"
              required
              rows="3"
            />
          </div>

          {/* Additional Details */}
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} />
              Additional Details
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
              placeholder="Any specific details about the equipment, special instructions, or requirements..."
              rows="4"
            />
            <div style={formHintStyle}>
              Example: "5kg CO2 extinguisher", "Annual maintenance", "Special access requirements"
            </div>
          </div>

          {/* Customer Info Preview */}
          {user && (
            <div style={{
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Your Contact Information:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '0.95rem',
                color: '#4b5563'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} />
                  <span style={{ fontWeight: '500' }}>{user.full_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} />
                  <span>{user.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              ...(loading ? submitButtonDisabledStyle : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                Object.assign(e.currentTarget.style, submitButtonHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, {
                ...submitButtonStyle,
                ...(loading ? submitButtonDisabledStyle : {})
              });
            }}
          >
            {loading ? (
              <>
                <div style={loadingSpinnerStyle} />
                Submitting Request...
              </>
            ) : (
              'Submit Service Request'
            )}
          </button>
        </form>
      </div>

      {/* Contact Info */}
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        fontSize: '0.95rem', 
        color: '#6b7280',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
      }}>
        <p style={{ marginBottom: '8px', fontWeight: '600' }}>
          Need immediate assistance?
        </p>
        <p>
          Call us: <strong>+265 999 999 999</strong> | Email: <strong>service@mordensafety.com</strong>
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.875rem' }}>
          Operating hours: Mon-Fri 8:00 AM - 5:00 PM, Sat 9:00 AM - 1:00 PM
        </p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 20px 16px;
            }
            
            .title {
              font-size: 2rem;
            }
            
            .card {
              padding: 24px 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ServiceRequest;