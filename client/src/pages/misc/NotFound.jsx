import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>404</div>
        <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Page Not Found</h1>
        <p className="auth-subtitle" style={{ marginTop: '0.5rem' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div style={{ marginTop: '1.75rem' }}>
          <Link to="/" className="btn btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
