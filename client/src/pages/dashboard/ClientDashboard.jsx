import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyClientArea = async () => {
      try {
        const data = await authService.checkClientArea();
        setApiStatus(data);
      } catch (err) {
        setError(err.message || 'Failed to verify client permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyClientArea();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Connecting to client portal..." />;
  }

  return (
    <div>
      {/* Dashboard Header */}
      <section className="dashboard-header">
        <div className="container dashboard-header-inner">
          <div>
            <h1 className="dashboard-greeting">Client Portal</h1>
            <div className="dashboard-meta">
              <span>Logged in as: <strong>{user?.name}</strong> ({user?.email})</span>
              <span>•</span>
              <span className="role-badge role-client">Client</span>
            </div>
          </div>
          <div>
            <span className="role-badge role-client" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              ✓ RBAC Verified
            </span>
          </div>
        </div>
      </section>

      <div className="container">
        {error && <Alert type="danger" message={error} />}

        {apiStatus && (
          <Alert type="success">
            <strong>Backend Security Check Passed:</strong> {apiStatus.message} (Role: {user?.role})
          </Alert>
        )}

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active Bookings</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Spend (Simulated)</div>
            <div className="stat-value">R0.00</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Projects</div>
            <div className="stat-value">0</div>
          </div>
        </div>

        {/* Integration Mount Point for Role 5 (Gig Browsing & Booking Flow) */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Explore Freelance Gigs</h2>
            <p className="card-subtitle">
              Browse services offered by verified freelancers and initiate bookings.
            </p>
          </div>

          <div className="feature-mount-point" id="client-gigs-marketplace-mount">
            <h3 className="feature-mount-title">Marketplace Gig Browser</h3>
            <p className="feature-mount-desc">
              This section is configured and ready for the gig browsing and booking flow interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
