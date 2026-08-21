const {
  isValidEmail,
  isValidPassword,
  isValidRole,
  sanitiseString
} = require('../utils/validators');

// REGISTRATION VALIDATION

const validateRegistration = (req, res, next) => {
  let { name, email, password, role } = req.body;

  // Sanitise string fields
 
  name = sanitiseString(name);
  email = sanitiseString(email).toLowerCase();
  role = sanitiseString(role).toLowerCase();

 // Check required fields individually
 
  const missingFields = [];

  if (!name) {
    missingFields.push('name');
  }

  if (!email) {
    missingFields.push('email');
  }

  if (!password) {
    missingFields.push('password');
  }

  if (missingFields.length > 0) {
    const fieldNames = missingFields.map(
      (field) => field.charAt(0).toUpperCase() + field.slice(1)
    );

    let message;

    if (fieldNames.length === 1) {
      message = `${fieldNames[0]} is required`;
    } else if (fieldNames.length === 2) {
      message = `${fieldNames[0]} and ${fieldNames[1]} are required`;
    } else {
      message = `${fieldNames.slice(0, -1).join(', ')} and ${fieldNames[fieldNames.length - 1]} are required`;
    }

    return res.status(400).json({
      success: false,
      message
    });
  }

  // ----------------------------------------------------------
  // Validate email format
  // ----------------------------------------------------------

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required'
    });
  }

  // ----------------------------------------------------------
  // Validate password strength
  // ----------------------------------------------------------

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must be at least 8 characters and contain uppercase, lowercase and numeric characters'
    });
  }

  // ----------------------------------------------------------
  // Validate role
  // ----------------------------------------------------------

  if (role && !isValidRole(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid registration role'
    });
  }

  // ----------------------------------------------------------
  // Store sanitised values
  // ----------------------------------------------------------

  req.body.name = name;
  req.body.email = email;
  req.body.role = role || 'client';

  next();
};

// ============================================================
// LOGIN VALIDATION
// ============================================================

const validateLogin = (req, res, next) => {
  let { email, password } = req.body;

  email = sanitiseString(email).toLowerCase();

  // ----------------------------------------------------------
  // Check required fields individually
  // ----------------------------------------------------------

  const missingFields = [];

  if (!email) {
    missingFields.push('email');
  }

  if (!password) {
    missingFields.push('password');
  }

  if (missingFields.length > 0) {
    const fieldNames = missingFields.map(
      (field) => field.charAt(0).toUpperCase() + field.slice(1)
    );

    let message;

    if (fieldNames.length === 1) {
      message = `${fieldNames[0]} is required`;
    } else {
      message = `${fieldNames[0]} and ${fieldNames[1]} are required`;
    }

    return res.status(400).json({
      success: false,
      message
    });
  }

  // ----------------------------------------------------------
  // Validate email format
  // ----------------------------------------------------------

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required'
    });
  }

  // ----------------------------------------------------------
  // Store sanitised email
  // ----------------------------------------------------------

  req.body.email = email;

  next();
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  validateRegistration,
  validateLogin
};