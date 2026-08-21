// Import JSON Web Token library for verifying authentication tokens.
const jwt = require('jsonwebtoken');

// Import the User model to find the authenticated user's account.
const User = require('../models/User');

// Verify that the request contains a valid JWT authentication token.
const authenticateToken = (req, res, next) => {
  try {
    // Get the Authorization header from the incoming request.
    const authHeader = req.headers.authorization;

    // Check that the Authorization header exists
    // and uses the required "Bearer <token>" format.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      });
    }

    // Extract the JWT from the "Bearer <token>" header.
    const token = authHeader.split(' ')[1];

    // Get the JWT secret from the environment configuration.
    const secret = process.env.JWT_SECRET;

    // Make sure the application has been configured
    // with a JWT secret before attempting verification.
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Authentication configuration error'
      });
    }

    // Verify the token using the configured JWT secret.
    // This also checks whether the token has expired.
    const decoded = jwt.verify(token, secret);

    // Find the user associated with the ID stored inside the JWT.
    const user = User.findById(decoded.id);

    // Reject the request if the user account no longer exists.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account could not be found'
      });
    }

    // Store only the required user information on the request.
    // Protected routes can use req.user after authentication.
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Authentication was successful.
    // Continue to the next middleware or protected route.
    next();
  } catch (error) {
    // Reject invalid, expired, or otherwise unusable JWTs.
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

// Create middleware that allows only the specified user roles
// to access a protected resource.
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {

    // Make sure the request has already been authenticated.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check whether the authenticated user's role is allowed.
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    // The user's role is authorized.
    // Continue to the next middleware or protected route.
    next();
  };
};

// Export the authentication and role-based authorization middleware.
module.exports = {
  authenticateToken,
  requireRole
};