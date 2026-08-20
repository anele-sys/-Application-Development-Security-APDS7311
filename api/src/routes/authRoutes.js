/**
 * Authentication Routes
 * Defines public and protected authentication endpoints
 */

const express = require('express');
const router = express.Router();

// Stub endpoints – will be fully implemented by the Auth & Data Lead
router.get('/status', (req, res) => {
  res.status(200).json({
    message: 'Authentication routes are ready',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me (requires token)'
    }
  });
});

module.exports = router;