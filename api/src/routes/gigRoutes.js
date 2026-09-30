const express = require('express');

const router = express.Router();

const {
  createGig,
  getGigs,
  getMyGigs,
  getGigById,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

const {
  authenticateToken,
  requireRole
} = require('../middleware/authMiddleware');

const {
  validateCreateGig,
  validateUpdateGig,
} = require('../middleware/validateInput');

// Anyone can browse active gigs
router.get('/', getGigs);

// Freelancers can manage all of their own gigs, including inactive listings
router.get(
  '/mine',
  authenticateToken,
  requireRole('freelancer'),
  getMyGigs
);

// Anyone can view a specific gig
router.get('/:id', getGigById);

// Only authenticated freelancers can create gigs
router.post(
  '/',
  authenticateToken,
  requireRole('freelancer'),
  validateCreateGig,
  createGig
);

// Only authenticated freelancers can update gigs
router.put(
  '/:id',
  authenticateToken,
  requireRole('freelancer'),
  validateUpdateGig,
  updateGig
);

// Only authenticated freelancers can delete gigs
router.delete(
  '/:id',
  authenticateToken,
  requireRole('freelancer'),
  deleteGig
);

module.exports = router;