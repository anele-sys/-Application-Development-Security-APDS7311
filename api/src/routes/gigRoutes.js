const express = require('express');

const router = express.Router();

const {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

const {
  authenticateToken,
  requireRole
} = require('../middleware/authMiddleware');

// Anyone can browse active gigs
router.get('/', getGigs);

// Anyone can view a specific gig
router.get('/:id', getGigById);

// Only authenticated freelancers can create gigs
router.post(
  '/',
  authenticateToken,
  requireRole('freelancer'),
  createGig
);

// Only authenticated freelancers can update gigs
router.put(
  '/:id',
  authenticateToken,
  requireRole('freelancer'),
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