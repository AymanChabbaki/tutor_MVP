import React from 'react';
import Button from './Button';

const Card = ({ 
  title, 
  children, 
  className = '',
  showCopyButton = false,
  copyText = '',
  onCopy,
  ...props 
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      if (onCopy) onCopy();
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showCopyButton && copyText && (
            <Button
              variant="ghost"
              size="small"
              onClick={handleCopy}
              className="ml-2"
            >
              📋 Copy
            </Button>
          )}
        </div>
      )}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
};

export default Card;