import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../services/api';
import { Calendar, MapPin, Clock, CheckCircle, Clock4, AlertCircle } from 'lucide-react';

const MyRequests = () => {
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
          Track the status of your service requests
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 space-y-6">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="text-secondary-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">No service requests yet</h2>
          <p className="text-secondary-600 max-w-md mx-auto">
            You haven't made any service requests yet. Start by browsing our products and requesting a service.
          </p>
          <a href="/service-request" className="btn-primary inline-block">
            Request a Service
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-secondary-900">
                      {request.service_type.charAt(0).toUpperCase() + request.service_type.slice(1)} Service
                    </h3>
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

                  {request.extinguisher_type && (
                    <p className="text-secondary-700">
                      <strong>Extinguisher Type:</strong> {request.extinguisher_type.replace('_', ' ').toUpperCase()}
                    </p>
                  )}

                  {request.quantity && (
                    <p className="text-secondary-700">
                      <strong>Quantity:</strong> {request.quantity}
                    </p>
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
                    <div className="flex items-center space-x-2">
                      <span className="text-secondary-700 font-medium">Quote:</span>
                      <span className="text-lg font-bold text-primary-600">
                        MK {request.quote_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className="text-sm text-secondary-500 font-mono">
                    {request.request_number}
                  </span>
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