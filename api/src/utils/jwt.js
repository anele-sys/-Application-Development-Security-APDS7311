// Import JSON Web Token library for creating authentication tokens.
const jwt = require('jsonwebtoken');

// Generate a JWT containing the authenticated user's identity and role.
const generateToken = (user) => {

  // Get the JWT secret from the environment configuration.
  const secret = process.env.JWT_SECRET;

  // Prevent token generation if the JWT secret is not configured.
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  // Create and sign the JWT with the user's identity and role.
  return jwt.sign(
    {
      // Store the user's unique ID in the token.
      id: user.id,

      // Store the user's email in the token.
      email: user.email,

      // Store the user's role for role-based access control.
      role: user.role
    },

    // Sign the token using the configured secret.
    secret,

    {
      // Set the token expiration time from the environment.
      // Defaults to one hour if no value is configured.
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

// Export the token generation function for use by the authentication controller.
module.exports = {
  generateToken
};