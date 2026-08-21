# Application-Development-Security-APDS7311

## Overview

This project is a secure Node.js and Express backend API for the HustleHub application. It implements authentication, role-based access control, security middleware, input validation, error handling, and HTTPS.

## Objective

To develop a secure backend API that supports user authentication and authorization while applying application security principles.

## Setup Instructions

1. Ensure Node.js is installed.

2. Navigate to the project folder.

3. Install the dependencies:

```bash
npm install
```

4. Configure the `.env` file.

5. Ensure the local SSL certificate files are available in the `certs` folder.

6. Start the development server:

```bash
npm run dev
```

7. Access the API at:

```text
https://localhost:4000
```

8. Test the API:

```bash
curl -k https://localhost:4000/health
```

## Authentication

The API supports three roles:

* Client
* Freelancer
* Admin

Clients and freelancers can register and log in through the authentication API.

The admin account is provisioned privately and is **not available through public registration**.

Authentication uses:

* bcrypt password hashing
* JWT authentication
* Role-based access control (RBAC)

## Security

The application includes:

* HTTPS with a local SSL certificate
* Helmet security headers
* CORS protection
* Request-size limits
* Input validation
* Invalid JSON handling
* JWT authentication
* Role-based authorization
* Controlled error handling
* 404 handling

## Testing

Authentication, authorization, security headers, CORS, invalid requests, request-size limits, and HTTPS have been tested successfully.

## Technologies

* JavaScript
* Node.js
* Express.js
* JWT
* bcryptjs
* Helmet
* CORS
* HTTPS
* OpenSSL
