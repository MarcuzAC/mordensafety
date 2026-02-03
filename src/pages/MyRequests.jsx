import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { requestsAPI } from '../services/api';
import { 
  Calendar, MapPin, Clock, CheckCircle, Clock4, 
  AlertCircle, PlusCircle, FileText, Camera, 
  Fingerprint, Shield, Building, Home 
} from 'lucide-react';

const MyRequests = () => {
  const { user } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestsAPI.getMyRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'in_progress':
        return <Clock4 className="text-blue-600" size={20} />;
      case 'pending':
        return <Clock className="text-orange-600" size={20} />;
      default:
        return <AlertCircle className="text-red-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'cctv_installation':
        return <Camera className="text-blue-600" size={20} />;
      case 'access_control':
        return <Fingerprint className="text-purple-600" size={20} />;
      case 'fire_safety':
        return <Shield className="text-red-600" size={20} />;
      case 'alarm_system':
        return <AlertCircle className="text-orange-600" size={20} />;
      case 'commercial_security':
        return <Building className="text-indigo-600" size={20} />;
      case 'residential_security':
        return <Home className="text-green-600" size={20} />;
      default:
        return <Shield className="text-gray-600" size={20} />;
    }
  };

  const formatServiceType = (serviceType) => {
    const serviceMap = {
      'cctv_installation': 'CCTV Installation',
      'access_control': 'Access Control System',
      'fire_safety': 'Fire Safety Service',
      'alarm_system': 'Alarm System',
      'commercial_security': 'Commercial Security',
      'residential_security': 'Residential Security',
      'extinguisher_refill': 'Fire Extinguisher Refill',
      'extinguisher_inspection': 'Fire Extinguisher Inspection',
      'safety_training': 'Safety Training'
    };
    
    return serviceMap[serviceType] || serviceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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
        <h1 className="text-3xl font-bold text-secondary-900">My Service Requests</h1>
        <p className="text-lg text-secondary-600">
          Track the status of your safety and security service requests
        </p>
      </div>

      {/* Request Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fire Safety Card */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 shadow-sm">
          <div className="flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Shield className="text-red-600" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Fire Safety Services</h2>
                <p className="text-gray-600">
                  Fire extinguisher refilling, inspection, and fire safety equipment
                </p>
              </div>
            </div>
            <div className="mt-auto">
              <Link
                to="/service-request?type=fire_safety"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap w-full justify-center"
              >
                <PlusCircle size={20} />
                Request Fire Safety Service
              </Link>
            </div>
          </div>
        </div>

        {/* Electronic Security Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Camera className="text-blue-600" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Electronic Security</h2>
                <p className="text-gray-600">
                  CCTV cameras, fingerprint scanners, alarm systems, and access control
                </p>
              </div>
            </div>
            <div className="mt-auto">
              <Link
                to="/service-request?type=electronic_security"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap w-full justify-center"
              >
                <PlusCircle size={20} />
                Request Security System
              </Link>
            </div>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="text-secondary-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">No service requests yet</h2>
          <p className="text-secondary-600 max-w-md mx-auto">
            You haven't made any service requests yet. Choose a service type above to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/service-request?type=fire_safety"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              <Shield size={20} />
              Request Fire Safety
            </Link>
            <Link
              to="/service-request?type=electronic_security"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              <Camera size={20} />
              Request Security System
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-secondary-900">Your Requests</h2>
            <span className="text-secondary-600">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {requests.map((request) => (
            <div key={request.id} className="card p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(request.service_type)}
                      <h3 className="text-xl font-semibold text-secondary-900">
                        {formatServiceType(request.service_type)}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span>{request.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <Calendar size={16} />
                      <span>
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <MapPin size={16} />
                      <span className="truncate">{request.address}</span>
                    </div>
                  </div>

                  {/* Service Specific Details */}
                  {request.extinguisher_type && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 font-medium">Equipment Details:</p>
                      <p className="text-gray-600">
                        <strong>Type:</strong> {request.extinguisher_type.replace('_', ' ').toUpperCase()}
                        {request.quantity && <span> • <strong>Quantity:</strong> {request.quantity}</span>}
                      </p>
                    </div>
                  )}

                  {request.security_system_type && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 font-medium">System Details:</p>
                      <p className="text-gray-600">
                        <strong>Type:</strong> {request.security_system_type.replace('_', ' ')}
                        {request.number_of_cameras && <span> • <strong>Cameras:</strong> {request.number_of_cameras}</span>}
                        {request.system_brand && <span> • <strong>Brand:</strong> {request.system_brand}</span>}
                      </p>
                    </div>
                  )}

                  {request.description && (
                    <div>
                      <p className="text-secondary-700 font-medium mb-1">Notes:</p>
                      <p className="text-secondary-600 text-sm bg-secondary-50 p-3 rounded-lg">
                        {request.description}
                      </p>
                    </div>
                  )}

                  {request.quote_amount && (
                    <div className="flex items-center space-x-2 mt-4">
                      <span className="text-secondary-700 font-medium">Quote Amount:</span>
                      <span className="text-lg font-bold text-primary-600">
                        MK {request.quote_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className="text-sm text-secondary-500 font-mono bg-gray-100 px-3 py-1 rounded">
                    ID: {request.request_number}
                  </span>
                  {request.scheduled_date && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary-700">Scheduled Date:</p>
                      <p className="text-sm text-secondary-600">
                        {new Date(request.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {request.completion_notes && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary-700">Completion Notes:</p>
                      <p className="text-sm text-secondary-600 max-w-xs">{request.completion_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;