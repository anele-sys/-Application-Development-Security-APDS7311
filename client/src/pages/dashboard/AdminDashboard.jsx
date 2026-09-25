import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [adminRes, healthRes] = await Promise.all([
          authService.checkAdminArea(),
          authService.checkHealth().catch(() => ({ status: 'Unavailable', protocol: 'Unknown' })),
        ]);
        setApiStatus(adminRes);
        setHealthStatus(healthRes);
      } catch (err) {
        setError(err.message || 'Failed to verify admin authorization.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Authenticating admin console..." />;
  }

  return (
    <div>
      <section className="dashboard-header">
        <div className="container dashboard-header-inner">
          <div>
            <h1 className="dashboard-greeting">System Administration Console</h1>
            <div className="dashboard-meta">
              <span>Logged in as: <strong>{user?.name}</strong> ({user?.email})</span>
              <span>•</span>
              <span className="role-badge role-admin">Administrator</span>
            </div>
          </div>
          <div>
            <span className="role-badge role-admin" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              🔒 Privileged Access
            </span>
          </div>
        </div>
      </section>

      <div className="container">
        {error && <Alert type="danger" message={error} />}

        {apiStatus && (
          <Alert type="success">
            <strong>Privileged Security Check Passed:</strong> {apiStatus.message}
          </Alert>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">API Health</div>
            <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: '1.3rem' }}>
              {healthStatus?.status === 'OK' ? '● Operational' : 'Degraded'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Protocol Mode</div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>
              {healthStatus?.protocol || 'HTTPS/TLS'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Security Policy</div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>
              Helmet + CSP Active
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Security &amp; Audit Logs</h2>
            <p className="card-subtitle">
              Monitor role-based access control policies, registered entities, and security metrics.
            </p>
          </div>
          <div className="feature-mount-point">
            <h3 className="feature-mount-title">Admin Monitoring Controls</h3>
            <p className="feature-mount-desc">
              All endpoints are secured with JSON Web Tokens and strict role-based access checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
