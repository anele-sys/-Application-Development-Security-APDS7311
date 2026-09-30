const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllGigsAdmin,
  updateGigAdmin,
  deleteGigAdmin,
  getPlatformAnalytics,
} = require('../controllers/adminController');

const {
  authenticateToken,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  validateUpdateGig,
} = require('../middleware/validateInput');

// All admin routes require JWT authentication and 'admin' role
router.use(authenticateToken, requireRole('admin'));

// Platform Analytics Overview
router.get('/analytics', getPlatformAnalytics);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Platform Gig Moderation
router.get('/gigs', getAllGigsAdmin);
router.put('/gigs/:id', validateUpdateGig, updateGigAdmin);
router.delete('/gigs/:id', deleteGigAdmin);

module.exports = router;
