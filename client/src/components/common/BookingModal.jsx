import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import bookingService from '../../services/bookingService';
import Alert from './Alert';

const formatZAR = (price) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(price));

const BookingModal = ({ gig, isOpen, onClose, onBookingSuccess }) => {
  const [requirements, setRequirements] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('simulated_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !gig) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await bookingService.create({
        gigId: gig._id,
        requirements: requirements.trim(),
        paymentMethod,
      });

      if (response.success && response.booking) {
        setConfirmedBooking(response.booking);
        if (onBookingSuccess) {
          onBookingSuccess(response.booking);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate simulated booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setRequirements('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {confirmedBooking ? 'Booking Confirmation' : 'Confirm & Secure Booking'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <CheckCircle
              size={56}
              color="var(--color-success)"
              style={{ margin: '0 auto 1rem', display: 'block' }}
            />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Booking Confirmed!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Your order has been placed and payment has been simulated successfully.
            </p>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'left',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
                <strong style={{ fontFamily: 'monospace' }}>
                  {confirmedBooking.transaction?.transactionId}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Service:</span>
                <strong>{confirmedBooking.gig?.title || gig.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Freelancer:</span>
                <strong>{confirmedBooking.freelancer?.name || gig.owner?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {confirmedBooking.transaction?.paymentMethod?.replace('_', ' ')} (Simulated)
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-medium)',
                  fontSize: '1.05rem',
                }}
              >
                <span style={{ fontWeight: 700 }}>Total Paid:</span>
                <strong style={{ color: 'var(--color-primary)' }}>
                  {formatZAR(confirmedBooking.price || gig.price)}
                </strong>
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleClose}>
              Done &amp; View Orders
            </button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit}>
            <div className="modal-body">
              {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

              {/* Selected Gig Summary */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span className="category-pill" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {gig.category}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>
                  {gig.title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Provider: <strong>{gig.owner?.name || 'Freelancer'}</strong>
                  </span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                    {formatZAR(gig.price)}
                  </strong>
                </div>
              </div>

              {/* Project Requirements */}
              <div className="form-group">
                <label className="form-label" htmlFor="booking-requirements">
                  Project Requirements / Brief (Optional)
                </label>
                <textarea
                  id="booking-requirements"
                  className="form-textarea"
                  rows={3}
                  maxLength={1000}
                  placeholder="Share details, specifications, or timelines with the freelancer..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Simulated Payment Method Selection */}
              <div className="form-group">
                <label className="form-label">Simulated Payment Method</label>
                <div className="payment-methods-grid">
                  <div
                    className={`payment-method-card ${paymentMethod === 'simulated_card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('simulated_card')}
                  >
                    <CreditCard size={20} style={{ margin: '0 auto 0.25rem', display: 'block' }} />
                    <span>Card Demo</span>
                  </div>
                  <div
                    className={`payment-method-card ${paymentMethod === 'instant_eft' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('instant_eft')}
                  >
                    <ShieldCheck size={20} style={{ margin: '0 auto 0.25rem', display: 'block' }} />
                    <span>Instant EFT</span>
                  </div>
                  <div
                    className={`payment-method-card ${paymentMethod === 'demo_wallet' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('demo_wallet')}
                  >
                    <FileText size={20} style={{ margin: '0 auto 0.25rem', display: 'block' }} />
                    <span>Demo Balance</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  ℹ Simulated sandbox transaction. No real credit card or bank credentials required.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing Transaction...' : `Confirm & Pay ${formatZAR(gig.price)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
