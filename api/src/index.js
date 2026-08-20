/**
 * HustleHub+ Application Server
 * Secure backend API with HTTPS and security middleware
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Import routes and middleware
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Create Express application
const app = express();

// Configuration from environment
const PORT = process.env.PORT || 4000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME || 'HustleHub';

// ============================================================
// 1. SECURITY MIDDLEWARE (Applied first)
// ============================================================

// Remove technology fingerprinting (X-Powered-By header)
app.disable('x-powered-by');

// Helmet – sets security headers including Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", CLIENT_ORIGIN],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginResourcePolicy: { policy: 'same-site' }
  })
);

// CORS – only allow requests from the configured frontend origin
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ============================================================
// 2. REQUEST PARSING MIDDLEWARE
// ============================================================

// Parse JSON request bodies with size limit (prevents oversized payloads)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================================
// 3. PUBLIC ROUTES
// ============================================================

// Health check endpoint (unauthenticated)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    protocol: USE_HTTPS ? 'HTTPS' : 'HTTP',
    timestamp: new Date().toISOString(),
    app: APP_NAME
  });
});

// Root endpoint – API information
app.get('/', (req, res) => {
  res.status(200).json({
    app: APP_NAME,
    message: 'API is running securely',
    version: '1.0.0',
    documentation: 'See README.md for API documentation'
  });
});

// ============================================================
// 4. API ROUTES (Mount all routes here)
// ============================================================

// Authentication routes (public + protected)
app.use('/api/auth', authRoutes);

// Future routes will be added here:
// app.use('/api/gigs', gigRoutes);
// app.use('/api/bookings', bookingRoutes);

// ============================================================
// 5. 404 HANDLER – Catch unmatched routes
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'The requested resource could not be found',
    path: req.originalUrl,
    method: req.method
  });
});

// ============================================================
// 6. GLOBAL ERROR HANDLER (Must be last)
// ============================================================

app.use(errorHandler);

// ============================================================
// 7. SERVER STARTUP – HTTP or HTTPS
// ============================================================

if (USE_HTTPS) {
  // Use HTTPS with self-signed certificate (development only)
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'certs', 'localhost-key.pem');
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'certs', 'localhost-cert.pem');

  try {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`\n${APP_NAME} API running securely on port ${PORT}`);
      console.log(`URL: https://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Started: ${new Date().toISOString()}\n`);
    });
  } catch (error) {
    console.error('Failed to start HTTPS server:');
    console.error(` ${error.message}`);
    console.error(' Please check that your SSL certificates exist in the certs/ folder.');
    console.error(' Run: openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365');
    console.error(' -keyout certs/localhost-key.pem -out certs/localhost-cert.pem -subj "/CN=localhost"\n');
    process.exit(1);
  }
} else {
  // HTTP mode (development only – not recommended)
  app.listen(PORT, () => {
    console.log(`\n ${APP_NAME} API running in HTTP mode on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Started: ${new Date().toISOString()}`);
    console.log(`HTTPS is DISABLED - enable by setting USE_HTTPS=true in .env\n`);
  });
}