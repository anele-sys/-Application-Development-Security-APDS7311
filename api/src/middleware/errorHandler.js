/**
 * Global Error Handler Middleware
 * Catches all errors and returns safe, controlled responses
 * NEVER exposes stack traces to the client
 */

const errorHandler = (err, req, res, next) => {
  // Log the error internally (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Unhandled Error:');
    console.error(`   Message: ${err.message}`);
    console.error(`   Path: ${req.originalUrl}`);
    console.error(`   Method: ${req.method}`);
    console.error(`   Stack: ${err.stack}`);
  }

  // Send a generic response to the client
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again later.',
    // Only include details in development for debugging
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      path: req.originalUrl,
      method: req.method
    })
  });
};

module.exports = errorHandler;