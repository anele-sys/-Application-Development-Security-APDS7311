/**
 * HustleHub+ Application Server
 * Secure backend API with HTTPS and security middleware
 */

// Load environment variables from the .env file
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.join(__dirname, '..', '..', '.env')
});

// Import required application and security packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Import application routes and global error-handling middleware
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

// Create the Express application
const app = express();

// Load application configuration from environment variables
const PORT = process.env.PORT || 4000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME || 'HustleHub';

// Provision the development administrator account
// The admin is created privately and is not available through public registration
const provisionAdmin = async () => {
  // Only provision the admin when the application is running in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Read the admin credentials from the environment configuration
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'HustleHub Administrator';

  // Stop provisioning if the required admin credentials are missing
  if (!adminEmail || !adminPassword) {
    console.warn('Admin provisioning skipped: ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
    return;
  }

  // Check whether the administrator already exists
  const existingAdmin = User.findByEmail(adminEmail);

  // Do not create a duplicate administrator
  if (existingAdmin) {
    return;
  }

  // Hash the administrator password before storing the account
  const hashedPassword = await bcrypt.hash(
    adminPassword,
    Number(process.env.SALT_ROUNDS) || 12
  );

  // Create the administrator using the private admin creation method
  User.createAdmin({
    name: adminName,
    email: adminEmail,
    password: hashedPassword
  });

  // Confirm that the development administrator was created
  console.log(`Development admin provisioned: ${adminEmail}`);
};

// Disable the X-Powered-By header to reduce technology fingerprinting
app.disable('x-powered-by');

// Configure Helmet to add security-related HTTP headers
app.use(
  helmet({
    // Configure Content Security Policy rules
    contentSecurityPolicy: {
      directives: {
        // Only allow resources from the application itself by default
        defaultSrc: ["'self'"],

        // Only allow scripts from the application itself
        scriptSrc: ["'self'"],

        // Only allow styles from the application itself
        styleSrc: ["'self'"],

        // Allow images from the application and data URLs
        imgSrc: ["'self'", 'data:'],

        // Allow connections to the application and configured frontend
        connectSrc: ["'self'", CLIENT_ORIGIN],

        // Prevent embedded objects
        objectSrc: ["'none'"],

        // Restrict the base URL used by the application
        baseUri: ["'self'"],

        // Prevent the application from being embedded in frames
        frameAncestors: ["'none'"]
      }
    },

    // Restrict cross-origin resource sharing behaviour
    crossOriginResourcePolicy: { policy: 'same-site' }
  })
);

// Configure CORS to allow requests only from the configured frontend
app.use(
  cors({
    origin: CLIENT_ORIGIN,

    // Allow only the HTTP methods required by the application
    methods: ['GET', 'POST', 'PUT', 'DELETE'],

    // Allow JSON requests and JWT authentication headers
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Parse JSON request bodies with a 10 KB size limit
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded request bodies with a 10 KB size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Provide a public health-check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',

    // Report whether the application is running over HTTP or HTTPS
    protocol: USE_HTTPS ? 'HTTPS' : 'HTTP',

    timestamp: new Date().toISOString(),
    app: APP_NAME
  });
});

// Provide basic information about the API
app.get('/', (req, res) => {
  res.status(200).json({
    app: APP_NAME,
    message: 'API is running securely',
    version: '1.0.0',
    documentation: 'See README.md for API documentation'
  });
});

// Mount authentication routes under /api/auth
app.use('/api/auth', authRoutes);

// Future application routes can be added here
// app.use('/api/gigs', gigRoutes);
// app.use('/api/bookings', bookingRoutes);

// Return a controlled response when a requested route does not exist
app.use((req, res) => {
  res.status(404).json({
    error: 'The requested resource could not be found',
    path: req.originalUrl,
    method: req.method
  });
});

// Handle errors that were not handled by the routes or middleware
app.use(errorHandler);

// Provision the development administrator before starting the server
provisionAdmin()
  .then(() => {
    // Start the application using HTTPS when USE_HTTPS is enabled
    if (USE_HTTPS) {

      // Load the private SSL key and certificate paths from the environment
      const keyPath = process.env.SSL_KEY_PATH || path.join(
        __dirname,
        '..',
        'certs',
        'localhost-key.pem'
      );

      const certPath = process.env.SSL_CERT_PATH || path.join(
        __dirname,
        '..',
        'certs',
        'localhost-cert.pem'
      );

      try {
        // Load the local SSL certificate and private key
        const httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        };

        // Create and start the HTTPS server
        https.createServer(httpsOptions, app).listen(PORT, () => {
          console.log(`\n${APP_NAME} API running securely on port ${PORT}`);
          console.log(`URL: https://localhost:${PORT}`);
          console.log(`Environment: ${process.env.NODE_ENV}`);
          console.log(`Started: ${new Date().toISOString()}\n`);
        });
      } catch (error) {
        // Stop the application if the SSL certificate cannot be loaded
        console.error('Failed to start HTTPS server:');
        console.error(` ${error.message}`);
        console.error(' Please check that your SSL certificates exist in the certs/ folder.');

        // Display the command that can be used to generate local certificates
        console.error(' Run: openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365');
        console.error(' -keyout certs/localhost-key.pem -out certs/localhost-cert.pem -subj "/CN=localhost"\n');

        process.exit(1);
      }
    } else {
      // Start the application using HTTP when HTTPS is disabled
      app.listen(PORT, () => {
        console.log(`\n ${APP_NAME} API running in HTTP mode on port ${PORT}`);
        console.log(`URL: http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Started: ${new Date().toISOString()}`);
        console.log(`HTTPS is DISABLED - enable by setting USE_HTTPS=true in .env\n`);
      });
    }
  })
  .catch((error) => {
    // Stop the application if administrator provisioning fails
    console.error('Failed to provision development admin:');
    console.error(error);
    process.exit(1);
  });