import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import gigService from '../../services/gigService';
import bookingService from '../../services/bookingService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const emptyGig = {
  title: '',
  description: '',
  category: '',
  price: '',
  status: 'active',
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(price || 0));

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gigs');
  const [apiStatus, setApiStatus] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState({
    totalEarned: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingGigId, setDeletingGigId] = useState(null);
  const [editingGigId, setEditingGigId] = useState(null);
  const [formData, setFormData] = useState(emptyGig);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadFreelancerData = async () => {
    try {
      const [statusData, gigData, bookingData] = await Promise.all([
        authService.checkFreelancerArea(),
        gigService.getMine(),
        bookingService.getFreelancerBookings().catch(() => ({ success: false, bookings: [] })),
      ]);

      setApiStatus(statusData);
      setGigs(gigData.gigs || []);
      if (bookingData.success) {
        setBookings(bookingData.bookings || []);
        if (bookingData.stats) {
          setBookingStats(bookingData.stats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load freelancer studio.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFreelancerData();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    setError(null);
    loadFreelancerData();
  };

  const resetForm = () => {
    setEditingGigId(null);
    setFormData(emptyGig);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSaving(true);

    const gigData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      ...(editingGigId ? { status: formData.status } : {}),
    };

    try {
      if (editingGigId) {
        const { gig } = await gigService.update(editingGigId, gigData);
        setGigs((currentGigs) =>
          currentGigs.map((currentGig) => (currentGig._id === gig._id ? gig : currentGig))
        );
        setNotice('Gig updated successfully.');
      } else {
        const { gig } = await gigService.create(gigData);
        setGigs((currentGigs) => [gig, ...currentGigs]);
        setNotice('Gig created successfully.');
      }

      resetForm();
    } catch (err) {
      setError(err.message || 'Could not save this gig.');
    } finally {
      setIsSaving(false);
    }
  };

  const editGig = (gig) => {
    setEditingGigId(gig._id);
    setFormData({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: String(gig.price),
      status: gig.status,
    });
    setError(null);
    setNotice(null);
    setActiveTab('gigs');
  };

  const removeGig = async (gig) => {
    if (!window.confirm(`Delete "${gig.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingGigId(gig._id);
    setError(null);
    setNotice(null);

    try {
      await gigService.remove(gig._id);
      setGigs((currentGigs) => currentGigs.filter((currentGig) => currentGig._id !== gig._id));
      if (editingGigId === gig._id) {
        resetForm();
      }
      setNotice('Gig deleted successfully.');
    } catch (err) {
      setError(err.message || 'Could not delete this gig.');
    } finally {
      setDeletingGigId(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await bookingService.updateStatus(bookingId, newStatus);
      if (response.success) {
        setNotice(`Order status updated to ${newStatus}.`);
        loadFreelancerData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Connecting to freelancer studio..." />;
  }

  const activeGigs = gigs.filter((gig) => gig.status === 'active').length;

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
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="role-badge role-freelancer gig-role-verified">
              ✓ Freelancer Verified
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw size={14} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </section>

      <div className="container freelancer-dashboard-content">
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}

        {apiStatus && (
          <Alert type="success">
            <strong>Backend Security Check Passed:</strong> {apiStatus.message} (Role: {user?.role})
          </Alert>
        )}

        {/* Dynamic Metric Stats Grid */}
        <div className="stats-grid gig-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Earned Income</div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {formatPrice(bookingStats.totalEarned)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Client Bookings</div>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {bookingStats.totalOrders}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Listings</div>
            <div className="stat-value">{activeGigs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Orders</div>
            <div className="stat-value">{bookingStats.completedOrders}</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'gigs' ? 'active' : ''}`}
            onClick={() => setActiveTab('gigs')}
          >
            <Briefcase size={16} />
            My Gig Listings ({gigs.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={16} />
            Client Orders &amp; Income ({bookings.length})
          </button>
        </div>

        {/* Tab 1: Manage Gigs */}
        {activeTab === 'gigs' && (
          <section className="gig-manager" aria-labelledby="gig-manager-title">
            <div className="gig-manager-grid">
              {/* Form */}
              <form className="card gig-form" onSubmit={handleSubmit}>
                <div className="gig-form-heading">
                  <h3>{editingGigId ? 'Edit Gig Listing' : 'Create a New Gig'}</h3>
                  <p>
                    {editingGigId
                      ? 'Update listing specifications or change visibility.'
                      : 'Publish a service offering to the HustleHub+ marketplace.'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gig-title">
                    Title
                  </label>
                  <input
                    className="form-input"
                    id="gig-title"
                    name="title"
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    minLength={3}
                    maxLength={100}
                    placeholder="e.g. Modern React &amp; Node.js Full-Stack App"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gig-category">
                    Category
                  </label>
                  <input
                    className="form-input"
                    id="gig-category"
                    name="category"
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    maxLength={100}
                    placeholder="e.g. Web Development, UI/UX Design, Security"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gig-description">
                    Description
                  </label>
                  <textarea
                    className="form-textarea gig-description-input"
                    id="gig-description"
                    name="description"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({ ...formData, description: event.target.value })
                    }
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Detail the deliverable, scope, and expertise provided..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gig-price">
                    Price (ZAR)
                  </label>
                  <input
                    className="form-input"
                    id="gig-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                    placeholder="e.g. 1500"
                    required
                  />
                </div>

                {editingGigId && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="gig-status">
                      Visibility
                    </label>
                    <select
                      className="form-select"
                      id="gig-status"
                      name="status"
                      value={formData.status}
                      onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                    >
                      <option value="active">Active (Public)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>
                )}

                <div className="gig-form-actions">
                  <button className="btn btn-primary" type="submit" disabled={isSaving}>
                    {editingGigId ? <Save size={16} /> : <Plus size={16} />}
                    {isSaving ? 'Saving...' : editingGigId ? 'Save Changes' : 'Publish Gig'}
                  </button>
                  {editingGigId && (
                    <button className="btn btn-secondary" type="button" onClick={resetForm}>
                      <X size={16} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Listings */}
              <section className="gig-list" aria-labelledby="gig-list-title">
                <div className="gig-list-heading">
                  <h3 id="gig-list-title">
                    Your Listings <span>{gigs.length}</span>
                  </h3>
                </div>

                {gigs.length === 0 ? (
                  <div className="gig-empty-state">
                    <Briefcase size={28} />
                    <h4>No listings yet</h4>
                    <p>Create your first gig listing to receive client orders.</p>
                  </div>
                ) : (
                  <ul className="gig-items">
                    {gigs.map((gig) => (
                      <li className="gig-item" key={gig._id}>
                        <div className="gig-item-topline">
                          <div>
                            <p className="gig-category">{gig.category}</p>
                            <h4>{gig.title}</h4>
                          </div>
                          <span className={`gig-status gig-status-${gig.status}`}>
                            {gig.status}
                          </span>
                        </div>
                        <p className="gig-item-description">{gig.description}</p>
                        <div className="gig-item-footer">
                          <strong>{formatPrice(gig.price)}</strong>
                          <div className="gig-item-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              type="button"
                              onClick={() => editGig(gig)}
                              aria-label={`Edit ${gig.title}`}
                            >
                              <Pencil size={15} />
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              type="button"
                              onClick={() => removeGig(gig)}
                              disabled={deletingGigId === gig._id}
                              aria-label={`Delete ${gig.title}`}
                            >
                              <Trash2 size={15} />
                              {deletingGigId === gig._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </section>
        )}

        {/* Tab 2: Client Orders & Income */}
        {activeTab === 'orders' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Client Bookings &amp; Income Tracker</h2>
              <p className="card-subtitle">
                Review client requests, update project progress, and monitor generated revenue.
              </p>
            </div>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  No client orders yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  When clients book your active gigs, their orders and simulated payments will appear here.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ref / Date</th>
                      <th>Gig &amp; Client</th>
                      <th>Requirements</th>
                      <th>Income (ZAR)</th>
                      <th>Status</th>
                      <th>Update Status</th>
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
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>
                            {booking.gig?.title || 'Listing'}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Client: <strong>{booking.client?.name || 'Client'}</strong> ({booking.client?.email})
                          </div>
                        </td>
                        <td style={{ maxWidth: '220px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {booking.requirements || 'No specific notes provided.'}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--color-success)', fontSize: '1rem' }}>
                            {formatPrice(booking.price)}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
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

export default FreelancerDashboard;
