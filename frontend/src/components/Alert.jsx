import React from 'react';

const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose, 
  className = '' 
}) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-lg">{iconMap[type]}</span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;