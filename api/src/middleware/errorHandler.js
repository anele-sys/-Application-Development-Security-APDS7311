const errorHandler = (err, req, res, next) => {
  // Log the full error only during development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Request body too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request body is too large'
    });
  }

  // Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body'
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID'
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: Object.values(err.errors).map((error) => error.message)
    });
  }

  // Duplicate MongoDB record
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'A record with the provided information already exists'
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.'
  });
};

module.exports = errorHandler;