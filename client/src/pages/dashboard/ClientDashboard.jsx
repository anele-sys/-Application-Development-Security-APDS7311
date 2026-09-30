import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, Search, RefreshCw, XCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import bookingService from '../../services/bookingService';
import GigMarketplace from '../../components/marketplace/GigMarketplace';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatZAR = (price) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(price || 0));

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('marketplace');
  const [apiStatus, setApiStatus] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchClientData = async () => {
    try {
      const [authRes, bookingRes] = await Promise.all([
        authService.checkClientArea(),
        bookingService.getClientBookings(),
      ]);
      setApiStatus(authRes);
      if (bookingRes.success) {
        setBookings(bookingRes.bookings || []);
        if (bookingRes.stats) {
          setStats(bookingRes.stats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load client data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setError(null);
    fetchClientData();
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await bookingService.updateStatus(bookingId, 'cancelled');
      if (response.success) {
        setActionNotice('Booking cancelled successfully.');
        fetchClientData();
      }
    } catch (err) {
      setError(err.message || 'Could not cancel booking.');
    }
  };

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
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="role-badge role-client" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              ✓ RBAC Verified
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </section>

      <div className="container">
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {actionNotice && <Alert type="success" message={actionNotice} onClose={() => setActionNotice('')} />}

        {apiStatus && (
          <Alert type="success">
            <strong>Backend Security Check Passed:</strong> {apiStatus.message} (Role: {user?.role})
          </Alert>
        )}

        {/* Dynamic Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active Bookings</div>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {stats.activeBookings}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Spend (Simulated)</div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {formatZAR(stats.totalSpend)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Projects</div>
            <div className="stat-value">{stats.completedBookings}</div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            <Search size={16} />
            Marketplace &amp; Gigs
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={16} />
            My Bookings &amp; Orders ({bookings.length})
          </button>
        </div>

        {/* Tab 1: Marketplace Gig Explorer */}
        {activeTab === 'marketplace' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Explore Freelance Gigs</h2>
              <p className="card-subtitle">
                Browse services offered by verified freelancers and book with simulated checkout.
              </p>
            </div>
            <GigMarketplace
              onBookingComplete={() => {
                fetchClientData();
                setActiveTab('orders');
              }}
            />
          </div>
        )}

        {/* Tab 2: My Bookings & Orders */}
        {activeTab === 'orders' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Order History &amp; Transactions</h2>
              <p className="card-subtitle">
                Track status, review requirements, and view simulated transaction details.
              </p>
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  No bookings yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Explore available freelance gigs to place your first booking.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab('marketplace')}
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ref / Date</th>
                      <th>Service &amp; Category</th>
                      <th>Freelancer</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
                            {booking.transaction?.transactionId || booking._id.substring(0, 8)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)', display: 'block' }}>
                            {booking.gig?.title || 'Listing'}
                          </strong>
                          <span className="category-pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                            {booking.gig?.category || 'General'}
                          </span>
                        </td>
                        <td>
                          <div>{booking.freelancer?.name || 'Freelancer'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {booking.freelancer?.email}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--color-primary)' }}>
                            {formatZAR(booking.price)}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {['pending', 'in_progress'].includes(booking.status) ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleCancelBooking(booking._id)}
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <XCircle size={14} />
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
