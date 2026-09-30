import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, ShoppingBag, User } from 'lucide-react';
import gigService from '../../services/gigService';
import { useAuth } from '../../context/AuthContext';
import BookingModal from '../common/BookingModal';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';

const formatZAR = (price) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(price));

const GigMarketplace = ({ onBookingComplete }) => {
  const { user, isAuthenticated } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGig, setSelectedGig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchGigs = async () => {
      try {
        const response = await gigService.getAll();
        if (isMounted) {
          setGigs(response.gigs || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load freelance services.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGigs();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['All', ...new Set(gigs.map((g) => g.category).filter(Boolean))];

  const filteredGigs = gigs.filter((gig) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      gig.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      gig.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleBookClick = (gig) => {
    setSelectedGig(gig);
    setIsModalOpen(true);
  };

  const handleBookingSuccess = (newBooking) => {
    if (onBookingComplete) {
      onBookingComplete(newBooking);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading marketplace services..." />;
  }

  return (
    <div className="marketplace-section">
      {error && <Alert type="danger" message={error} />}

      {/* Search & Category Filter Toolbar */}
      <div className="marketplace-toolbar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="Search gigs by skill, title, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="marketplace-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gigs Grid */}
      {filteredGigs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Sparkles size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
            No listings found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Try adjusting your search keywords or switching category filters.
          </p>
        </div>
      ) : (
        <div className="marketplace-grid">
          {filteredGigs.map((gig) => {
            const isOwnGig = user && user.id === gig.owner?._id;
            const isClient = user?.role === 'client';

            return (
              <div key={gig._id} className="marketplace-card">
                <div>
                  <div className="marketplace-card-header">
                    <span className="category-pill" style={{ fontSize: '0.75rem' }}>
                      {gig.category}
                    </span>
                    <span className="gig-owner-badge">
                      <User size={12} />
                      {gig.owner?.name || 'Freelancer'}
                    </span>
                  </div>

                  <h3 className="marketplace-card-title">{gig.title}</h3>
                  <p className="marketplace-card-desc">{gig.description}</p>
                </div>

                <div className="marketplace-card-footer">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      Price
                    </span>
                    <span className="marketplace-price">{formatZAR(gig.price)}</span>
                  </div>

                  {isAuthenticated && isClient ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBookClick(gig)}
                      disabled={isOwnGig}
                    >
                      <ShoppingBag size={14} />
                      Book Now
                    </button>
                  ) : !isAuthenticated ? (
                    <a href="/login" className="btn btn-secondary btn-sm">
                      Sign in to Book
                    </a>
                  ) : isOwnGig ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Your Listing
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled
                      title="Only Clients can book gigs"
                    >
                      Client Only
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Checkout Modal */}
      <BookingModal
        gig={selectedGig}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default GigMarketplace;
