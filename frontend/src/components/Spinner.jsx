import React from 'react';

const Spinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  className = '',
  centered = true 
}) => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const containerClasses = [
    'flex flex-col items-center justify-center',
    centered ? 'min-h-[200px]' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <svg
        className={`animate-spin text-blue-600 ${sizes[size]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <p className="mt-3 text-gray-600 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

export default Spinner;