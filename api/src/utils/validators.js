// Roles that can be selected during public user registration.
// Admin accounts are created separately through admin provisioning.
const VALID_ROLES = ['client', 'freelancer'];

// Check whether an email address has a valid basic format.
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Check whether a password meets the minimum security requirements.
// The password must contain at least 8 characters, one uppercase
// letter, one lowercase letter, and one number.
const isValidPassword = (password) => {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

// Check whether the supplied role is allowed for public registration.
const isValidRole = (role) => {
  return VALID_ROLES.includes(role);
};

// Remove unnecessary whitespace from string input.
// Return an empty string when the supplied value is not a string.
const sanitiseString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

// Export the validation constants and helper functions.
module.exports = {
  VALID_ROLES,
  isValidEmail,
  isValidPassword,
  isValidRole,
  sanitiseString
};