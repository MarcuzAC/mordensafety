import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { requestsAPI } from '../services/api';
import { 
  MapPin, MessageSquare, CheckCircle, 
  User, Mail, Phone, Wrench, Package, 
  Calendar, AlertTriangle, CheckSquare,
  Home, Clock, Shield
} from 'lucide-react';

const ServiceRequest = () => {
  const { user } = useApp(); // Removed cart dependency
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service_type: 'inspection',
    extinguisher_type: '',
    address: '',
    description: '',
    preferred_date: '',
    preferred_time: 'morning'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');

  const serviceTypes = [
    { value: 'inspection', label: 'Safety Inspection', icon: 'check-square', desc: 'Regular safety equipment check' },
    { value: 'maintenance', label: 'Maintenance', icon: 'wrench', desc: 'Routine maintenance service' },
    { value: 'refill', label: 'Refill/Recharge', icon: 'package', desc: 'Refill fire extinguishers' },
    { value: 'installation', label: 'Installation', icon: 'home', desc: 'New equipment installation' },
    { value: 'repair', label: 'Repair', icon: 'alert-triangle', desc: 'Equipment repair service' },
    { value: 'training', label: 'Training', icon: 'shield', desc: 'Fire safety training' },
  ];

  const extinguisherTypes = [
    { value: '', label: 'Select extinguisher type (If applicable)' },
    { value: 'abc_powder', label: 'ABC Powder' },
    { value: 'co2', label: 'CO2' },
    { value: 'water', label: 'Water' },
    { value: 'foam', label: 'Foam' },
    { value: 'wet_chemical', label: 'Wet Chemical' },
    { value: 'clean_agent', label: 'Clean Agent' },
    { value: 'water_mist', label: 'Water Mist' },
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (8AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (1PM - 5PM)' },
    { value: 'evening', label: 'Evening (6PM - 8PM)' },
    { value: 'anytime', label: 'Anytime' },
  ];

  const getIconComponent = (iconName) => {
    switch(iconName) {
      case 'wrench': return <Wrench size={18} />;
      case 'package': return <Package size={18} />;
      case 'calendar': return <Calendar size={18} />;
      case 'check-square': return <CheckSquare size={18} />;
      case 'alert-triangle': return <AlertTriangle size={18} />;
      case 'home': return <Home size={18} />;
      case 'shield': return <Shield size={18} />;
      default: return <CheckSquare size={18} />;
    }
  };

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
        customer_name: user?.full_name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
      };

      const response = await requestsAPI.createRequest(requestData);
      setSuccess(true);
      setRequestId(response.data.request_id || response.data.id || 'SR-' + Date.now().toString().slice(-6));
      
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Failed to create service request. Please try again or contact support.');
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

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={successContainerStyle}>
          <div style={successIconContainerStyle}>
            <CheckCircle size={48} color="white" />
          </div>
          
          <h1 style={successTitleStyle}>
            Service Request Submitted Successfully!
          </h1>
          
          <p style={successMessageStyle}>
            Thank you for your service request. Our team will contact you shortly to confirm the details and schedule your service.
          </p>

          <div style={requestIdStyle}>
            Request ID: {requestId}
          </div>

          <div style={infoBoxStyle}>
            <div style={infoTitleStyle}>
              <Clock size={18} />
              What happens next?
            </div>
            <ul style={infoListStyle}>
              <li>Our team will review your request within 24 hours</li>
              <li>You'll receive a call/email to confirm service details</li>
              <li>We'll provide a service quote and schedule</li>
              <li>Service will be performed by certified technicians</li>
              <li>You'll receive a service report upon completion</li>
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
        <h1 style={titleStyle}>Schedule a Service</h1>
        <p style={subtitleStyle}>
          Request professional fire safety services for your premises. Fill out the form below and our certified technicians will contact you.
        </p>
      </div>

      {/* Main Form Card */}
      <div style={cardStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
      >
        <h2 style={formTitleStyle}>
          <Wrench size={24} />
          Service Request Details
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Service Type */}
          <div>
            <label style={labelStyle}>
              Type of Service Required
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
            {serviceTypes.find(t => t.value === formData.service_type)?.desc && (
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '6px' }}>
                {serviceTypes.find(t => t.value === formData.service_type).desc}
              </div>
            )}
          </div>

          {/* Extinguisher Type */}
          <div>
            <label style={labelStyle}>
              Equipment Type (If applicable)
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

          {/* Preferred Date */}
          <div>
            <label style={labelStyle}>
              Preferred Service Date
            </label>
            <input
              type="date"
              name="preferred_date"
              value={formData.preferred_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
            />
          </div>

          {/* Preferred Time */}
          <div>
            <label style={labelStyle}>
              Preferred Time Slot
            </label>
            <select
              name="preferred_time"
              value={formData.preferred_time}
              onChange={handleChange}
              style={selectStyle}
              onFocus={(e) => Object.assign(e.target.style, selectFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, selectStyle)}
            >
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          {/* Service Address */}
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
              placeholder="Enter the complete address where service is needed"
              required
              rows="3"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={16} />
              Additional Notes or Special Instructions
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
              placeholder="Any special requirements, access codes, parking instructions, or additional information that would help our technicians..."
              rows="4"
            />
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
                  {user.full_name || 'Not provided'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} />
                  {user.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} />
                  {user.phone || 'Not provided'}
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

      {/* Info Section */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.95rem', color: '#6b7280' }}>
          <p>
            Need urgent assistance? Call us at <strong>+265 999 999 999</strong>
          </p>
          <p style={{ marginTop: '8px' }}>
            Our team typically responds within 2-4 business hours
          </p>
        </div>
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