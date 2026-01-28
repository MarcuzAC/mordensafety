import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full card border-l-4 ${
        type === 'success' ? 'border-l-green-500' : 'border-l-red-500'
      } ${bgColor} transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start space-x-3 p-4">
        <Icon className={`flex-shrink-0 ${textColor}`} size={20} />
        <div className="flex-1">
          <p className={`font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;