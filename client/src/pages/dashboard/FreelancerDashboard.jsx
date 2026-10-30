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
  TrendingUp,
  Search,
  Filter,
  Eye,
  EyeOff,
  Tag,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import gigService from '../../services/gigService';
import bookingService from '../../services/bookingService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import IncomeTaxDashboard from '../../components/dashboard/IncomeTaxDashboard';

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
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

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
    setIsFormOpen(false);
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
    setIsFormOpen(true);
    setError(null);
    setNotice(null);
    setActiveTab('gigs');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const toggleGigStatus = async (gig) => {
    const newStatus = gig.status === 'active' ? 'inactive' : 'active';
    try {
      const { gig: updated } = await gigService.update(gig._id, {
        title: gig.title,
        description: gig.description,
        category: gig.category,
        price: Number(gig.price),
        status: newStatus,
      });
      setGigs((currentGigs) =>
        currentGigs.map((g) => (g._id === gig._id ? updated : g))
      );
      setNotice(
        `Listing "${gig.title}" is now ${newStatus === 'active' ? 'Live on Marketplace (Active)' : 'Hidden (Inactive)'}.`
      );
    } catch (err) {
      setError(err.message || 'Could not change listing visibility.');
    }
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

  const filteredGigs = gigs.filter((gig) => {
    const matchesStatus =
      listingStatusFilter === 'all' || gig.status === listingStatusFilter;
    const query = (listingSearch || '').toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      gig.title?.toLowerCase().includes(query) ||
      gig.category?.toLowerCase().includes(query) ||
      gig.description?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

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
          <button
            type="button"
            className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
            onClick={() => setActiveTab('tax')}
          >
            <TrendingUp size={16} />
            Tax &amp; Financial Insights
          </button>
        </div>

        {/* Tab 1: Manage Gigs */}
        {activeTab === 'gigs' && (
          <section className="gig-manager" aria-labelledby="gig-manager-title">
            {/* Header Toolbar */}
            <div className="listings-toolbar-card">
              <div className="listings-toolbar-left">
                <div className="listings-search-box">
                  <Search size={16} className="text-muted" />
                  <input
                    type="text"
                    className="listings-search-input"
                    placeholder="Filter your listings by title, skill, or keyword..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                  />
                  {listingSearch && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => setListingSearch('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="filter-pill-group">
                  <button
                    type="button"
                    className={`filter-pill ${listingStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setListingStatusFilter('all')}
                  >
                    All ({gigs.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${listingStatusFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setListingStatusFilter('active')}
                  >
                    <span className="dot dot-active" /> Active ({activeGigs})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${listingStatusFilter === 'inactive' ? 'active' : ''}`}
                    onClick={() => setListingStatusFilter('inactive')}
                  >
                    <span className="dot dot-inactive" /> Inactive ({gigs.length - activeGigs})
                  </button>
                </div>
              </div>

              <div className="listings-toolbar-right">
                <button
                  type="button"
                  className={`btn ${isFormOpen ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => {
                    if (isFormOpen && !editingGigId) {
                      setIsFormOpen(false);
                    } else {
                      resetForm();
                      setIsFormOpen(true);
                    }
                  }}
                >
                  {isFormOpen ? (
                    <>
                      <X size={16} /> Close Form
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Create New Gig
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Create / Edit Form Card */}
            {isFormOpen && (
              <form className="card gig-form-card" onSubmit={handleSubmit}>
                <div className="gig-form-heading">
                  <div>
                    <h3>{editingGigId ? 'Edit Service Listing' : 'Publish New Service Listing'}</h3>
                    <p>
                      {editingGigId
                        ? 'Update listing specifications, pricing, or visibility.'
                        : 'Showcase your skills and start receiving client orders.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={resetForm}
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="gig-title">
                      Listing Title
                    </label>
                    <input
                      className="form-input"
                      id="gig-title"
                      name="title"
                      value={formData.title}
                      onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                      minLength={3}
                      maxLength={100}
                      placeholder="e.g. Modern Full-Stack Web Development (React & Node.js)"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gig-category">
                      Service Category
                    </label>
                    <input
                      className="form-input"
                      id="gig-category"
                      name="category"
                      value={formData.category}
                      onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                      maxLength={100}
                      placeholder="e.g. Web Development, UI/UX Design, Security Audit"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="gig-description">
                    Service Scope &amp; Deliverables
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
                    placeholder="Describe exactly what deliverables the client receives, technologies used, revisions included, and delivery expectations..."
                    required
                  />
                </div>

                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="gig-price">
                      Fixed Price (ZAR)
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
                      placeholder="e.g. 2500"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gig-status">
                      Visibility Status
                    </label>
                    <select
                      className="form-select"
                      id="gig-status"
                      name="status"
                      value={formData.status}
                      onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                    >
                      <option value="active">Active (Discoverable on Marketplace)</option>
                      <option value="inactive">Inactive (Hidden Draft)</option>
                    </select>
                  </div>
                </div>

                <div className="gig-form-actions">
                  <button className="btn btn-primary" type="submit" disabled={isSaving}>
                    {editingGigId ? <Save size={16} /> : <Plus size={16} />}
                    {isSaving ? 'Saving...' : editingGigId ? 'Save Changes' : 'Publish Listing'}
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Listings Grid */}
            <div className="listings-grid-wrapper">
              <div className="listings-section-header">
                <div>
                  <h3 id="gig-list-title">
                    Your Listings <span>{filteredGigs.length}</span>
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {listingSearch || listingStatusFilter !== 'all'
                      ? `Showing ${filteredGigs.length} of ${gigs.length} total listings`
                      : 'Manage your active offerings and pricing for marketplace clients.'}
                  </p>
                </div>
              </div>

              {filteredGigs.length === 0 ? (
                <div className="gig-empty-state">
                  <Briefcase size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                  <h4>{gigs.length === 0 ? 'No listings created yet' : 'No matching listings found'}</h4>
                  <p>
                    {gigs.length === 0
                      ? 'Publish your first freelance service listing to start earning and receiving client orders.'
                      : 'Try adjusting your search terms or filter criteria.'}
                  </p>
                  {gigs.length === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsFormOpen(true)}
                      style={{ marginTop: '0.75rem' }}
                    >
                      <Plus size={15} /> Create Your First Gig
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setListingSearch('');
                        setListingStatusFilter('all');
                      }}
                      style={{ marginTop: '0.75rem' }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="freelancer-gig-cards-grid">
                  {filteredGigs.map((gig) => {
                    const isEditing = editingGigId === gig._id;
                    return (
                      <div
                        className={`freelancer-gig-card ${isEditing ? 'card-editing' : ''}`}
                        key={gig._id}
                      >
                        {/* Top Category and Status Row */}
                        <div className="card-top-row">
                          <span className="card-category-badge">
                            <Tag size={12} style={{ marginRight: 4 }} />
                            {gig.category}
                          </span>
                          <span
                            className={`card-status-badge status-${gig.status}`}
                            title={`Status is ${gig.status}`}
                          >
                            <span className={`status-dot ${gig.status === 'active' ? 'dot-active' : 'dot-inactive'}`} />
                            {gig.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Title and Description */}
                        <h4 className="card-gig-title">{gig.title}</h4>
                        <p className="card-gig-description">{gig.description}</p>

                        {/* Price Banner */}
                        <div className="card-price-row">
                          <div>
                            <span className="price-label">Price</span>
                            <div className="price-amount">{formatPrice(gig.price)}</div>
                          </div>
                          <button
                            type="button"
                            className="btn-status-toggle"
                            onClick={() => toggleGigStatus(gig)}
                            title={gig.status === 'active' ? 'Click to hide listing' : 'Click to make public'}
                          >
                            {gig.status === 'active' ? (
                              <>
                                <Eye size={14} className="text-success" />
                                <span>Public</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={14} className="text-muted" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Card Actions */}
                        <div className="card-actions-row">
                          <button
                            className="btn btn-secondary btn-sm"
                            type="button"
                            onClick={() => editGig(gig)}
                            aria-label={`Edit ${gig.title}`}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => removeGig(gig)}
                            disabled={deletingGigId === gig._id}
                            aria-label={`Delete ${gig.title}`}
                          >
                            <Trash2 size={14} />
                            {deletingGigId === gig._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

        {/* Tab 3: Tax & Financial Insights */}
        {activeTab === 'tax' && <IncomeTaxDashboard />}
      </div>
    </div>
  );
};

export default FreelancerDashboard;
