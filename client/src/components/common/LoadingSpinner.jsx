import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  return (
    <div className="loading-container">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {message && <p style={{ fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
