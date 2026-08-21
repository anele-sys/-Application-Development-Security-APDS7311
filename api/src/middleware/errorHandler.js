/**
 * Global Error Handler Middleware
 * Catches all errors and returns safe, controlled responses
 * NEVER exposes stack traces to the client
 */

const errorHandler = (err, req, res, next) => {
  // Log the error internally (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled Error:');
    console.error(` Message: ${err.message}`);
    console.error(` Path: ${req.originalUrl}`);
    console.error(` Method: ${req.method}`);
    console.error(` Stack: ${err.stack}`);
  }

  // Request body exceeds the configured limit
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload is too large',
      message: 'The request body exceeds the maximum allowed size'
    });
  }

  // Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'The request contains invalid JSON'
    });
  }

  // Generic server error
  return res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.'
  });
};

module.exports = errorHandler;