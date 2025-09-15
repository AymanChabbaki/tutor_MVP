import React from 'react';

const LoadingSpinner = ({ message = "Processing your request..." }) => {
  return (
    <div className="loading-container">
      <div className="spinner" role="status" aria-label="Loading" />
      <p style={{ marginTop: '.75rem', color: '#6b7280' }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
