import React, { useState, useEffect } from 'react';
import {
  Shield,
  RefreshCw,
  Users,
  Briefcase,
  Layers,
  FileText,
  Trash2,
  Pencil,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Save,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import bookingService from '../../services/bookingService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatZAR = (price) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(price || 0));

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStatus, setApiStatus] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [gigsList, setGigsList] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [gigSearch, setGigSearch] = useState('');
  const [gigStatusFilter, setGigStatusFilter] = useState('all');

  // Edit Gig Modal State
  const [editingGig, setEditingGig] = useState(null);
  const [gigFormData, setGigFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    status: 'active',
  });
  const [isSavingGig, setIsSavingGig] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [adminRes, healthRes, analyticsRes, usersRes, gigsRes, bookingsRes] =
        await Promise.all([
          authService.checkAdminArea(),
          authService.checkHealth().catch(() => ({ status: 'Unavailable', protocol: 'Unknown' })),
          adminService.getAnalytics().catch(() => ({ success: false, analytics: null })),
          adminService.getUsers().catch(() => ({ success: false, users: [] })),
          adminService.getGigs().catch(() => ({ success: false, gigs: [] })),
          bookingService.getAdminAll().catch(() => ({ success: false, bookings: [] })),
        ]);

      setApiStatus(adminRes);
      setHealthStatus(healthRes);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (usersRes.success) setUsersList(usersRes.users || []);
      if (gigsRes.success) setGigsList(gigsRes.gigs || []);
      if (bookingsRes.success) setAdminBookings(bookingsRes.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator console.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setError(null);
    setNotice(null);
    fetchAdminData();
  };

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.success) {
        setNotice(`User role updated to ${newRole}.`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userItem) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${userItem.name}" (${userItem.email})? All their gigs will also be deleted.`
      )
    ) {
      return;
    }

    try {
      const response = await adminService.deleteUser(userItem._id);
      if (response.success) {
        setNotice('User account deleted successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  // Gig Actions
  const handleOpenEditGig = (gig) => {
    setEditingGig(gig);
    setGigFormData({
      title: gig.title,
      description: gig.description,
      category: gig.category,
      price: String(gig.price),
      status: gig.status,
    });
  };

  const handleSaveGig = async (e) => {
    e.preventDefault();
    if (!editingGig) return;

    setIsSavingGig(true);
    setError(null);
    setNotice(null);

    try {
      const response = await adminService.updateGig(editingGig._id, {
        title: gigFormData.title,
        description: gigFormData.description,
        category: gigFormData.category,
        price: Number(gigFormData.price),
        status: gigFormData.status,
      });

      if (response.success) {
        setNotice(`Gig "${gigFormData.title}" updated successfully.`);
        setEditingGig(null);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update gig.');
    } finally {
      setIsSavingGig(false);
    }
  };

  const handleDeleteGig = async (gig) => {
    if (!window.confirm(`Are you sure you want to permanently remove gig "${gig.title}"?`)) {
      return;
    }

    try {
      const response = await adminService.deleteGig(gig._id);
      if (response.success) {
        setNotice('Gig listing removed successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete gig.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Authenticating admin console..." />;
  }

  // Filtered Users List
  const filteredUsers = usersList.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      userSearch.trim() === '' ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Gigs List
  const filteredGigs = gigsList.filter((g) => {
    const matchesStatus = gigStatusFilter === 'all' || g.status === gigStatusFilter;
    const matchesSearch =
      gigSearch.trim() === '' ||
      g.title?.toLowerCase().includes(gigSearch.toLowerCase()) ||
      g.category?.toLowerCase().includes(gigSearch.toLowerCase()) ||
      g.owner?.name?.toLowerCase().includes(gigSearch.toLowerCase()) ||
      g.owner?.email?.toLowerCase().includes(gigSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Dashboard Header */}
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
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="role-badge role-admin" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              🔒 Privileged Access
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
        {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}

        {apiStatus && (
          <Alert type="success">
            <strong>Privileged Security Check Passed:</strong> {apiStatus.message} (Role: {user?.role})
          </Alert>
        )}

        {/* Global Platform Metrics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {analytics?.users?.total ?? usersList.length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Marketplace Gigs</div>
            <div className="stat-value">{analytics?.gigs?.total ?? gigsList.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Platform Volume</div>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {formatZAR(analytics?.bookings?.totalVolume ?? 0)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">API Health</div>
            <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>
              {healthStatus?.status === 'OK' ? '● Operational' : 'Degraded'}
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Shield size={16} />
            Overview &amp; Security
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            Users Management ({usersList.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'gigs' ? 'active' : ''}`}
            onClick={() => setActiveTab('gigs')}
          >
            <Briefcase size={16} />
            Gig Listings Moderation ({gigsList.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <FileText size={16} />
            Transactions Audit ({adminBookings.length})
          </button>
        </div>

        {/* Tab 1: Overview & Security Policy */}
        {activeTab === 'overview' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h2 className="card-title">Security &amp; Policy Status</h2>
                <p className="card-subtitle">
                  Active security layers safeguarding application transport, authentication, and data access.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Transport Security</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TLS 1.3 / HTTPS Active ({healthStatus?.protocol || 'HTTPS'})</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Authentication</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stateless JWT (HMAC SHA-256)</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Access Control</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Strict RBAC (Client, Freelancer, Admin)</div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Rate Limiting &amp; CSP</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Helmet Security Headers + Endpoint Limiters</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">User Distribution</h2>
                <p className="card-subtitle">Breakdown of registered accounts across marketplace roles.</p>
              </div>
              <div className="stats-grid" style={{ marginTop: '0.5rem' }}>
                <div className="stat-card">
                  <div className="stat-label">Clients</div>
                  <div className="stat-value">{analytics?.users?.clients ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Freelancers</div>
                  <div className="stat-value">{analytics?.users?.freelancers ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Administrators</div>
                  <div className="stat-value">{analytics?.users?.admins ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Manage Registered Users</h2>
              <p className="card-subtitle">View account credentials, inspect activity, modify roles, or delete users.</p>
            </div>

            {/* Toolbar */}
            <div className="marketplace-toolbar">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="marketplace-categories">
                {['all', 'client', 'freelancer', 'admin'].map((roleKey) => (
                  <button
                    key={roleKey}
                    type="button"
                    className={`category-pill ${userRoleFilter === roleKey ? 'active' : ''}`}
                    onClick={() => setUserRoleFilter(roleKey)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {roleKey}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Activity</th>
                    <th>Joined</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelf = u._id === user?.id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>
                            {u.name} {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>(You)</span>}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</span>
                        </td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>
                            {u.role === 'freelancer' ? `${u.gigCount || 0} gigs` : `${u.totalBookings || 0} orders`}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={isSelf}
                          >
                            <option value="client">Client</option>
                            <option value="freelancer">Freelancer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete self' : 'Delete user'}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Marketplace Gigs Moderation */}
        {activeTab === 'gigs' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Marketplace Gigs Moderation</h2>
              <p className="card-subtitle">
                Supervise, edit specifications, adjust prices, or remove any service listing across the platform.
              </p>
            </div>

            {/* Toolbar */}
            <div className="marketplace-toolbar">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search gigs by title, owner, or category..."
                  value={gigSearch}
                  onChange={(e) => setGigSearch(e.target.value)}
                />
              </div>
              <div className="marketplace-categories">
                {['all', 'active', 'inactive'].map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    className={`category-pill ${gigStatusFilter === statusKey ? 'active' : ''}`}
                    onClick={() => setGigStatusFilter(statusKey)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {statusKey}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Listing Title &amp; Category</th>
                    <th>Owner / Freelancer</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGigs.map((gig) => (
                    <tr key={gig._id}>
                      <td>
                        <strong style={{ display: 'block', color: 'var(--text-main)' }}>{gig.title}</strong>
                        <span className="category-pill" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                          {gig.category}
                        </span>
                      </td>
                      <td>
                        <div>{gig.owner?.name || 'Unknown'}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{gig.owner?.email}</span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{formatZAR(gig.price)}</strong>
                      </td>
                      <td>
                        <span className={`gig-status gig-status-${gig.status}`}>{gig.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(gig.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditGig(gig)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteGig(gig)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Transactions Audit */}
        {activeTab === 'transactions' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Platform Transactions &amp; Audit Logs</h2>
              <p className="card-subtitle">
                Complete record of client-freelancer orders and simulated payment transactions.
              </p>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref / Date</th>
                    <th>Gig Service</th>
                    <th>Client</th>
                    <th>Freelancer</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
                          {booking.transaction?.transactionId || booking._id.substring(0, 8)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(booking.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <strong>{booking.gig?.title || 'Listing'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.gig?.category}</div>
                      </td>
                      <td>
                        <div>{booking.client?.name || 'Client'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.client?.email}</div>
                      </td>
                      <td>
                        <div>{booking.freelancer?.name || 'Freelancer'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.freelancer?.email}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>{formatZAR(booking.price)}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>
                          {booking.transaction?.paymentMethod?.replace('_', ' ') || 'Simulated'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Gig Modal for Admin */}
        {editingGig && (
          <div className="modal-overlay" onClick={() => setEditingGig(null)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Admin: Edit Gig Listing</h2>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setEditingGig(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveGig}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label" htmlFor="admin-gig-title">
                      Title
                    </label>
                    <input
                      id="admin-gig-title"
                      className="form-input"
                      value={gigFormData.title}
                      onChange={(e) => setGigFormData({ ...gigFormData, title: e.target.value })}
                      minLength={3}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="admin-gig-category">
                      Category
                    </label>
                    <input
                      id="admin-gig-category"
                      className="form-input"
                      value={gigFormData.category}
                      onChange={(e) => setGigFormData({ ...gigFormData, category: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="admin-gig-desc">
                      Description
                    </label>
                    <textarea
                      id="admin-gig-desc"
                      className="form-textarea"
                      rows={4}
                      value={gigFormData.description}
                      onChange={(e) => setGigFormData({ ...gigFormData, description: e.target.value })}
                      minLength={10}
                      maxLength={2000}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="admin-gig-price">
                        Price (ZAR)
                      </label>
                      <input
                        id="admin-gig-price"
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={gigFormData.price}
                        onChange={(e) => setGigFormData({ ...gigFormData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="admin-gig-status">
                        Visibility Status
                      </label>
                      <select
                        id="admin-gig-status"
                        className="form-select"
                        value={gigFormData.status}
                        onChange={(e) => setGigFormData({ ...gigFormData, status: e.target.value })}
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingGig(null)}
                    disabled={isSavingGig}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSavingGig}>
                    <Save size={16} />
                    {isSavingGig ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
