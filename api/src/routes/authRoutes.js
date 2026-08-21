// Import Express to create the authentication router.
const express = require('express');
const router = express.Router();

// Import authentication controller functions.
const {
  register,
  login,
  getProfile
} = require('../controllers/authController');

// Import input validation middleware.
const {
  validateRegistration,
  validateLogin
} = require('../middleware/validateInput');

// Import authentication and role-based access control middleware.
const {
  authenticateToken,
  requireRole
} = require('../middleware/authMiddleware');

// Return the available authentication endpoints and supported roles.
router.get('/status', (req, res) => {
  res.status(200).json({
    message: 'Authentication routes are ready',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me'
    },
    roles: ['client', 'freelancer', 'admin']
  });
});

// Allow users to create a new account.
// Registration input is validated before the controller runs.
router.post(
  '/register',
  validateRegistration,
  register
);

// Allow registered users to log in.
// Login input is validated before the controller runs.
router.post(
  '/login',
  validateLogin,
  login
);

// Return the profile of the currently authenticated user.
// A valid JWT is required before the controller runs.
router.get(
  '/me',
  authenticateToken,
  getProfile
);

// Allow only authenticated clients to access the client area.
router.get(
  '/client-area',
  authenticateToken,
  requireRole('client'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Client access granted',
      user: req.user
    });
  }
);

// Allow only authenticated freelancers to access the freelancer area.
router.get(
  '/freelancer-area',
  authenticateToken,
  requireRole('freelancer'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Freelancer access granted',
      user: req.user
    });
  }
);

// Allow only authenticated administrators to access the admin area.
router.get(
  '/admin-area',
  authenticateToken,
  requireRole('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Admin access granted',
      user: req.user
    });
  }
);

// Export the authentication router.
module.exports = router;