import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyFreelancerArea = async () => {
      try {
        const data = await authService.checkFreelancerArea();
        setApiStatus(data);
      } catch (err) {
        setError(err.message || 'Failed to verify freelancer permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyFreelancerArea();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Connecting to freelancer studio..." />;
  }

  return (
    <div>
      {/* Dashboard Header */}
      <section className="dashboard-header">
        <div className="container dashboard-header-inner">
          <div>
            <h1 className="dashboard-greeting">Freelancer Studio</h1>
            <div className="dashboard-meta">
              <span>Logged in as: <strong>{user?.name}</strong> ({user?.email})</span>
              <span>•</span>
              <span className="role-badge role-freelancer">Freelancer</span>
            </div>
          </div>
          <div>
            <span className="role-badge role-freelancer" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              ✓ Freelancer Role Verified
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

        {/* Financial & Gig Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Published Gigs</div>
            <div className="stat-value">0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Earned</div>
            <div className="stat-value">R0.00</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">0</div>
          </div>
        </div>

        {/* Integration Mount Point for Role 5 (Gig Management & Dashboard Features) */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Service Listings &amp; Gigs</h2>
            <p className="card-subtitle">
              Manage your active service listings, create new gigs, and view incoming client orders.
            </p>
          </div>

          <div className="feature-mount-point" id="freelancer-gig-management-mount">
            <h3 className="feature-mount-title">Gig Management Workspace</h3>
            <p className="feature-mount-desc">
              This section is configured and ready for the gig creation form and listings table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
