# Application-Development-Security-APDS7311

## Project Overview

HustleHub is a secure freelance marketplace platform where freelancers can advertise services and clients can browse and book those services. The wider platform is expected to handle sensitive information such as user credentials, financial transactions, income earned, and estimated tax obligations.

## Intended Users

The system is designed for three types of users:

* **Clients** can create accounts, sign in, view their profile, and access client-only resources.
* **Freelancers** can create accounts, sign in, view their profile, and access freelancer-only resources.
* **Administrators** manage privileged operations through a private administrator account. Administrators cannot register through the public registration endpoint.

The API is intended to be used by a HustleHub frontend or API client such as Postman. Users interact with the backend through HTTPS requests, while the API validates requests, authenticates accounts, and enforces access based on the user's role.

## Prerequisites

Before starting, install the following:

* Node.js and npm
* OpenSSL
* Git, if cloning the repository

## Project Structure

* `api/src/index.js` starts the application.
* `api/src/routes` contains the API routes.
* `api/src/controllers` contains request and authentication logic.
* `api/src/middleware` contains validation, authentication, and error-handling middleware.
* `api/src/models` contains the user model.
* `api/tests` contains automated tests.
* `api/certs` stores the local HTTPS certificate files.


## Setup and Installation

### 1. Configure the environment

Create or update the `.env` file in the project root. At minimum, provide a secure `JWT_SECRET`. Generate one in Bash with:

	openssl rand -base64 64

The application also supports `PORT`, `NODE_ENV`, `USE_HTTPS`, `CLIENT_ORIGIN`, `APP_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` environment variables.

### 2. Generate local certificates

Open Bash in the `api/certs` folder and run:

	MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 -keyout localhost-key.pem -out localhost-cert.pem -subj "/CN=localhost"

The certificate files must be named `localhost-key.pem` and `localhost-cert.pem` unless custom paths are provided through `SSL_KEY_PATH` and `SSL_CERT_PATH`.

### 3. Install dependencies

Navigate to the `api` folder before running npm commands. Do not run them from the project root:

	cd api
	npm install

### 4. Start the API

Start the server normally with:

	npm start

For automatic restarts during development, use:

	npm run dev

When HTTPS is enabled, the API is available at:

	https://localhost:4000

The health endpoint can be checked with:

	curl -k https://localhost:4000/health

The `-k` option allows curl to connect to the locally generated, self-signed certificate.

## API Endpoints

Authentication routes are available under `/api/auth`:

* `GET /api/auth/status` checks that the authentication routes are available.
* `POST /api/auth/register` registers a client or freelancer.
* `POST /api/auth/login` authenticates a user and returns a JWT.
* `GET /api/auth/me` returns the authenticated user's profile.
* `GET /api/auth/client-area` requires the `client` role.
* `GET /api/auth/freelancer-area` requires the `freelancer` role.
* `GET /api/auth/admin-area` requires the `admin` role.

Protected endpoints require the JWT in the request's Authorization header using the Bearer scheme.

The admin account is provisioned privately from environment variables when `NODE_ENV=development`. It is not available through public registration.

## Testing and Code Quality

Run these commands from the `api` folder:

* `npm test` runs the Jest test suite.
* `npm run test:coverage` generates a Jest coverage report.
* `npm run lint` checks the source code with ESLint.
* `npm run test:api` runs the Postman collection with Newman.

The Postman files are located in `api/postman`.

## Security Decisions

The following security decisions were made to protect user accounts, requests, and API resources:

* **Password hashing:** Passwords are hashed with bcryptjs before they are stored. This means the application does not store users' passwords as readable text, reducing the impact of a database exposure.
* **Token-based authentication:** Successful login returns a signed JSON Web Token (JWT). Protected routes verify the token before allowing access, so the API can authenticate requests without sending a password with every request.
* **Role-based access control:** Client, freelancer, and admin areas are protected by role checks. This follows the principle of least privilege by allowing users to access only the resources intended for their role.
* **Input validation:** Registration and login input is validated before controller logic runs. Validation helps reject missing, malformed, or unsafe input and makes API responses more predictable.
* **HTTPS:** HTTPS encrypts data in transit, including login credentials and JWTs, and helps prevent attackers on the network from reading or modifying requests. Local certificates are used for development testing.
* **Security headers:** Helmet adds protective HTTP headers, including Content Security Policy, to reduce browser-based risks such as content injection and clickjacking.
* **Restricted CORS:** Requests are accepted only from the configured frontend origin. This prevents unauthorised browser-based applications from making cross-origin requests to the API.
* **Request-size limits:** JSON and URL-encoded request bodies are limited to 10 KB. This reduces unnecessary resource consumption from oversized requests.
* **Generic login errors:** Unknown emails and incorrect passwords return the same message. This makes it harder to discover which email addresses have accounts.
* **Controlled error handling:** Invalid routes and unexpected errors receive controlled responses instead of exposing internal implementation details.

## Technologies

* JavaScript
* Node.js
* Express.js
* Jest and Supertest
* Newman
* JSON Web Tokens
* bcryptjs
* Helmet
* CORS
* HTTPS and OpenSSL
