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
// GIG VALIDATION
// ============================================================

const validateCreateGig = (req, res, next) => {
  let { title, description, category, price } = req.body;

  title = sanitiseString(title);
  description = sanitiseString(description);
  category = sanitiseString(category);
  const numPrice = Number(price);

  if (!title || title.length < 3 || title.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title is required and must be between 3 and 100 characters',
    });
  }

  if (!description || description.length < 10 || description.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Description is required and must be between 10 and 2000 characters',
    });
  }

  if (!category || category.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Category is required (maximum 100 characters)',
    });
  }

  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a valid positive number',
    });
  }

  req.body.title = title;
  req.body.description = description;
  req.body.category = category;
  req.body.price = numPrice;

  next();
};

const validateUpdateGig = (req, res, next) => {
  let { title, description, category, price, status } = req.body;

  if (title !== undefined) {
    title = sanitiseString(title);
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be between 3 and 100 characters',
      });
    }
    req.body.title = title;
  }

  if (description !== undefined) {
    description = sanitiseString(description);
    if (description.length < 10 || description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 10 and 2000 characters',
      });
    }
    req.body.description = description;
  }

  if (category !== undefined) {
    category = sanitiseString(category);
    if (!category || category.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Category must be non-empty and up to 100 characters',
      });
    }
    req.body.category = category;
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number',
      });
    }
    req.body.price = numPrice;
  }

  if (status !== undefined) {
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'inactive'",
      });
    }
  }

  next();
};

// ============================================================
// BOOKING VALIDATION
// ============================================================

const validateCreateBooking = (req, res, next) => {
  let { gigId, requirements, paymentMethod } = req.body;

  if (!gigId) {
    return res.status(400).json({
      success: false,
      message: 'Gig ID is required to create a booking',
    });
  }

  if (requirements) {
    requirements = sanitiseString(requirements);
    if (requirements.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Requirements description cannot exceed 1000 characters',
      });
    }
    req.body.requirements = requirements;
  } else {
    req.body.requirements = '';
  }

  if (paymentMethod && !['simulated_card', 'instant_eft', 'demo_wallet'].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment method selected',
    });
  }

  req.body.paymentMethod = paymentMethod || 'simulated_card';

  next();
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  validateRegistration,
  validateLogin,
  validateCreateGig,
  validateUpdateGig,
  validateCreateBooking,
};