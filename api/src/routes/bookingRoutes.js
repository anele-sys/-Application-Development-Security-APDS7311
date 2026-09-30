const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  createBooking,
  getClientBookings,
  getFreelancerBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookingsAdmin,
} = require('../controllers/bookingController');

const {
  authenticateToken,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  validateCreateBooking,
} = require('../middleware/validateInput');

// Rate limiter for booking creation to prevent rapid transaction spam
const bookingRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 20, // Max 20 booking requests per 5 minutes per IP
  message: {
    success: false,
    message: 'Too many booking requests. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Client initiates a new booking with simulated payment
router.post(
  '/',
  authenticateToken,
  requireRole('client'),
  bookingRateLimiter,
  validateCreateBooking,
  createBooking
);

// Client views their own bookings & orders
router.get(
  '/client',
  authenticateToken,
  requireRole('client'),
  getClientBookings
);

// Freelancer views received bookings & income metrics
router.get(
  '/freelancer',
  authenticateToken,
  requireRole('freelancer'),
  getFreelancerBookings
);

// Admin views all bookings across the platform
router.get(
  '/admin/all',
  authenticateToken,
  requireRole('admin'),
  getAllBookingsAdmin
);

// Get single booking by ID (client, freelancer, or admin)
router.get(
  '/:id',
  authenticateToken,
  getBookingById
);

// Update booking status
router.patch(
  '/:id/status',
  authenticateToken,
  updateBookingStatus
);

module.exports = router;
