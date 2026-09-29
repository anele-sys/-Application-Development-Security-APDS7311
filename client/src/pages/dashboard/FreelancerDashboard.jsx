import React, { useEffect, useState } from 'react';
import { Briefcase, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import gigService from '../../services/gigService';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const emptyGig = {
  title: '',
  description: '',
  category: '',
  price: '',
  status: 'active'
};

const formatPrice = (price) => new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR'
}).format(Number(price));

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingGigId, setDeletingGigId] = useState(null);
  const [editingGigId, setEditingGigId] = useState(null);
  const [formData, setFormData] = useState(emptyGig);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [statusData, gigData] = await Promise.all([
          authService.checkFreelancerArea(),
          gigService.getMine()
        ]);

        if (isMounted) {
          setApiStatus(statusData);
          setGigs(gigData.gigs);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load your gigs.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshGigs = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await gigService.getMine();
      setGigs(data.gigs);
    } catch (err) {
      setError(err.message || 'Could not refresh your gigs.');
    } finally {
      setIsRefreshing(false);
    }
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
      ...(editingGigId ? { status: formData.status } : {})
    };

    try {
      if (editingGigId) {
        const { gig } = await gigService.update(editingGigId, gigData);
        setGigs((currentGigs) => currentGigs.map((currentGig) => (
          currentGig._id === gig._id ? gig : currentGig
        )));
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
      status: gig.status
    });
    setError(null);
    setNotice(null);
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

  if (isLoading) {
    return <LoadingSpinner message="Connecting to freelancer studio..." />;
  }

  const activeGigs = gigs.filter((gig) => gig.status === 'active').length;
  const inactiveGigs = gigs.length - activeGigs;

  return (
    <div>
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
          <span className="role-badge role-freelancer gig-role-verified">
            Freelancer Role Verified
          </span>
        </div>
      </section>

      <div className="container freelancer-dashboard-content">
        {error && <Alert type="danger" message={error} />}
        {notice && <Alert type="success" message={notice} />}

        {apiStatus && (
          <Alert type="success">
            <strong>Backend Security Check Passed:</strong> {apiStatus.message} (Role: {user?.role})
          </Alert>
        )}

        <div className="stats-grid gig-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active gigs</div>
            <div className="stat-value">{activeGigs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">All listings</div>
            <div className="stat-value">{gigs.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Inactive gigs</div>
            <div className="stat-value">{inactiveGigs}</div>
          </div>
        </div>

        <section className="gig-manager" aria-labelledby="gig-manager-title">
          <div className="gig-manager-heading">
            <div>
              <h2 id="gig-manager-title">My gigs</h2>
              <p>Create a listing, keep its details current, or take it offline.</p>
            </div>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={refreshGigs}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} aria-hidden="true" />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="gig-manager-grid">
            <form className="card gig-form" onSubmit={handleSubmit}>
              <div className="gig-form-heading">
                <h3>{editingGigId ? 'Edit gig' : 'Create a gig'}</h3>
                <p>{editingGigId ? 'Update the listing details below.' : 'Add a service to your public listings.'}</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gig-title">Title</label>
                <input
                  className="form-input"
                  id="gig-title"
                  name="title"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  minLength={3}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gig-category">Category</label>
                <input
                  className="form-input"
                  id="gig-category"
                  name="category"
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gig-description">Description</label>
                <textarea
                  className="form-textarea gig-description-input"
                  id="gig-description"
                  name="description"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gig-price">Price (ZAR)</label>
                <input
                  className="form-input"
                  id="gig-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                  required
                />
              </div>

              {editingGigId && (
                <div className="form-group">
                  <label className="form-label" htmlFor="gig-status">Visibility</label>
                  <select
                    className="form-select"
                    id="gig-status"
                    name="status"
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="gig-form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSaving}>
                  {editingGigId ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                  {isSaving ? 'Saving...' : editingGigId ? 'Save changes' : 'Create gig'}
                </button>
                {editingGigId && (
                  <button className="btn btn-secondary" type="button" onClick={resetForm}>
                    <X size={16} aria-hidden="true" />
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <section className="gig-list" aria-labelledby="gig-list-title">
              <div className="gig-list-heading">
                <h3 id="gig-list-title">Your listings <span>{gigs.length}</span></h3>
              </div>

              {gigs.length === 0 ? (
                <div className="gig-empty-state">
                  <Briefcase size={24} aria-hidden="true" />
                  <h4>No gigs yet</h4>
                  <p>Your new listing will appear here after you create it.</p>
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
                            <Pencil size={15} aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => removeGig(gig)}
                            disabled={deletingGigId === gig._id}
                            aria-label={`Delete ${gig.title}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
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
      </div>
    </div>
  );
};

export default FreelancerDashboard;
