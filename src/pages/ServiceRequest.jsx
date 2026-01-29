import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { requestsAPI } from '../services/api';
import { 
  MapPin, MessageSquare, CheckCircle, 
  User, Mail, Phone, Wrench, Package, 
  Calendar, AlertTriangle, CheckSquare,
  Home, Clock, Shield, Hash, AlertCircle
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
  const [requestData, setRequestData] = useState(null);
  const [error, setError] = useState('');

  // Exactly as shown in API documentation
  const serviceTypes = [
    { value: 'refill', label: 'Refill' },
    { value: 'installation', label: 'Installation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'repair', label: 'Repair' },
    { value: 'training', label: 'Training' },
  ];

  // Exactly as shown in API example
  const extinguisherTypes = [
    { value: '', label: 'Select extinguisher type (Optional)' },
    { value: 'CO2', label: 'CO2' },
    { value: 'ABC Powder', label: 'ABC Powder' },
    { value: 'Water', label: 'Water' },
    { value: 'Foam', label: 'Foam' },
    { value: 'Wet Chemical', label: 'Wet Chemical' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare request data exactly as API expects
      const requestPayload = {
        service_type: formData.service_type,
        extinguisher_type: formData.extinguisher_type || null,
        quantity: formData.quantity,
        address: formData.address.trim(),
        description: formData.description.trim() || ''
      };

      // Validation
      if (!requestPayload.address) {
        throw new Error('Address is required');
      }

      if (requestPayload.quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      const response = await requestsAPI.createRequest(requestPayload);
      
      // Check response format exactly as shown in API
      if (response.data && response.data.success === true && response.data.request) {
        setSuccess(true);
        setRequestData(response.data.request);
      } else {
        throw new Error('Invalid response format from server');
      }
      
    } catch (err) {
      console.error('Service request error:', err);
      
      // Handle validation errors
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.detail;
        const errorMessage = validationErrors
          .map(error => `${error.loc[1]}: ${error.msg}`)
          .join(', ');
        setError(`Validation error: ${errorMessage}`);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create service request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      service_type: 'refill',
      extinguisher_type: '',
      quantity: 1,
      address: '',
      description: ''
    });
    setSuccess(false);
    setRequestData(null);
    setError('');
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
    marginTop: '20px',
  };

  const submitButtonDisabledStyle = {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.7,
  };

  const errorAlertStyle = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '0.95rem',
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

  const requestCardStyle = {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
    textAlign: 'left',
    border: '1px solid #e5e7eb',
  };

  const requestFieldStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.95rem',
  };

  const requestLabelStyle = {
    fontWeight: '600',
    color: '#374151',
    minWidth: '140px',
  };

  const requestValueStyle = {
    color: '#4b5563',
    textAlign: 'right',
    flex: 1,
  };

  const requestIdStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e40af',
    background: '#eff6ff',
    padding: '12px 20px',
    borderRadius: '12px',
    margin: '20px 0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '300px',
    margin: '30px auto 0',
  };

  const primaryButtonStyle = {
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

  const secondaryButtonStyle = {
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

  if (success && requestData) {
    return (
      <div style={containerStyle}>
        <div style={successContainerStyle}>
          <div style={successIconContainerStyle}>
            <CheckCircle size={48} color="white" />
          </div>
          
          <h1 style={successTitleStyle}>
            Service Request Created Successfully!
          </h1>
          
          <p style={successMessageStyle}>
            Your service request has been submitted. Here are your request details:
          </p>

          <div style={requestIdStyle}>
            <Hash size={18} />
            Request Number: {requestData.request_number}
          </div>

          <div style={requestCardStyle}>
            <div style={requestFieldStyle}>
              <span style={requestLabelStyle}>Service Type:</span>
              <span style={requestValueStyle}>{requestData.service_type}</span>
            </div>
            <div style={requestFieldStyle}>
              <span style={requestLabelStyle}>Extinguisher Type:</span>
              <span style={requestValueStyle}>{requestData.extinguisher_type || 'Not specified'}</span>
            </div>
            <div style={requestFieldStyle}>
              <span style={requestLabelStyle}>Quantity:</span>
              <span style={requestValueStyle}>{requestData.quantity}</span>
            </div>
            <div style={requestFieldStyle}>
              <span style={requestLabelStyle}>Address:</span>
              <span style={requestValueStyle}>{requestData.address}</span>
            </div>
            {requestData.description && (
              <div style={requestFieldStyle}>
                <span style={requestLabelStyle}>Description:</span>
                <span style={requestValueStyle}>{requestData.description}</span>
              </div>
            )}
            <div style={requestFieldStyle}>
              <span style={requestLabelStyle}>Status:</span>
              <span style={{...requestValueStyle, 
                color: requestData.status === 'pending' ? '#f59e0b' : 
                       requestData.status === 'in_progress' ? '#3b82f6' : 
                       requestData.status === 'completed' ? '#10b981' : '#6b7280'
              }}>
                {requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1)}
              </span>
            </div>
            <div style={{...requestFieldStyle, borderBottom: 'none'}}>
              <span style={requestLabelStyle}>Created:</span>
              <span style={requestValueStyle}>
                {new Date(requestData.created_at).toLocaleDateString()} at {new Date(requestData.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div style={buttonContainerStyle}>
            <button
              onClick={() => navigate('/my-requests')}
              style={primaryButtonStyle}
            >
              View All My Requests
            </button>
            <button
              onClick={resetForm}
              style={secondaryButtonStyle}
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Create Service Request</h1>
        <p style={subtitleStyle}>
          Fill out the form below to request fire safety services. All fields marked with * are required.
        </p>
      </div>

      {/* Main Form Card */}
      <div style={cardStyle}>
        <h2 style={formTitleStyle}>
          <Wrench size={24} />
          Service Request Form
        </h2>
        
        {error && (
          <div style={errorAlertStyle}>
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Service Type - Required */}
          <div>
            <label style={requiredLabelStyle}>
              Service Type<span style={requiredStarStyle}>*</span>
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

          {/* Extinguisher Type - Optional */}
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
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '6px' }}>
              Leave blank if not applicable
            </div>
          </div>

          {/* Quantity - Required */}
          <div>
            <label style={requiredLabelStyle}>
              Quantity<span style={requiredStarStyle}>*</span>
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
              required
            />
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '6px' }}>
              Number of units requiring service
            </div>
          </div>

          {/* Address - Required */}
          <div>
            <label style={requiredLabelStyle}>
              Service Address<span style={requiredStarStyle}>*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
              placeholder="Enter complete service address"
              required
              rows="3"
            />
          </div>

          {/* Description - Optional */}
          <div>
            <label style={labelStyle}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={textareaStyle}
              onFocus={(e) => Object.assign(e.target.style, textareaFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, textareaStyle)}
              placeholder="Additional details, special instructions, or requirements"
              rows="4"
            />
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '6px' }}>
              Example: "5kg CO2 extinguisher", "Annual maintenance", "Special access requirements"
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              ...(loading ? submitButtonDisabledStyle : {})
            }}
          >
            {loading ? (
              <>
                <div style={loadingSpinnerStyle} />
                Submitting...
              </>
            ) : (
              'Submit Service Request'
            )}
          </button>
        </form>
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