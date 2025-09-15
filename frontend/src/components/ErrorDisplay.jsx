import React from 'react';

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="error-container" role="alert">
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '.5rem' }}>
      <span style={{ fontSize: '1.25rem', marginRight: '.5rem' }}>⚠️</span>
      <h4 style={{ fontWeight: 600 }}>Something went wrong</h4>
    </div>
    <p style={{ marginBottom: '.75rem' }}>{error}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-primary">Try Again</button>
    )}
  </div>
);

export default ErrorDisplay;
