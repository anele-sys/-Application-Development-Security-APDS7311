import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'freelancer') return '/freelancer-dashboard';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/client-dashboard';
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
        <h1 className="auth-title" style={{ fontSize: '1.5rem', color: 'var(--color-danger)' }}>
          Access Denied
        </h1>
        <p className="auth-subtitle" style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>
          You do not have the required role permissions to access this protected resource.
          {user && (
            <span>
              {' '}
              Your current account role is <strong className="role-badge" style={{ verticalAlign: 'middle' }}>{user.role}</strong>.
            </span>
          )}
        </p>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to={getDashboardPath()} className="btn btn-primary">
            Return to Authorized Dashboard
          </Link>
          <Link to="/" className="btn btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
