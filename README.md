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

* `api/src/index.js` starts the backend application.
* `api/src/routes` contains the API routes (authentication, gigs).
* `api/src/controllers` contains request and authentication logic.
* `api/src/middleware` contains validation, authentication, and error-handling middleware.
* `api/src/models` contains the user and gig models.
* `api/tests` contains automated backend tests.
* `api/certs` stores the local HTTPS certificate files.
* `client/src` contains the React frontend single-page application (Role 4).
* `client/src/services` contains the centralized API client and auth service layer.
* `client/src/context` contains global authentication and session state.
* `client/src/components` contains protected route guards, navigation, and reusable UI components.
* `client/src/pages` contains auth pages (Login, Register), home, and role dashboards.


## Setup and Installation

### 1. Configure the environment

Create or update the `.env` file in the project root. At minimum, provide a secure `JWT_SECRET`. Generate one in Bash with:

	openssl rand -base64 64

The application also supports `PORT`, `NODE_ENV`, `USE_HTTPS`, `CLIENT_ORIGIN`, `APP_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` environment variables.

### 2. Generate local certificates (for Backend HTTPS)

Open Bash in the `api/certs` folder and run:

	MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 -keyout localhost-key.pem -out localhost-cert.pem -subj "/CN=localhost"

The certificate files must be named `localhost-key.pem` and `localhost-cert.pem` unless custom paths are provided through `SSL_KEY_PATH` and `SSL_CERT_PATH`.

### 3. Install dependencies

Install API dependencies:
```bash
cd api
npm install
```

Install Client dependencies:
```bash
cd ../client
npm install
```

### 4. Start the Application Stack

**Start Backend API:**
```bash
cd api
npm run dev
```
*(Backend runs on `http://localhost:4000` or `https://localhost:4000`)*

**Start Frontend Client:**
```bash
cd client
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

When HTTPS is enabled on the backend, the API is available at `https://localhost:4000`. The health endpoint can be checked with:
```bash
curl -k https://localhost:4000/health
```
*(The `-k` flag allows curl to connect to the locally generated, self-signed certificate.)*

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

* **Password hashing:** Passwords are hashed with bcryptjs before they are stored. This means the application does not store users' passwords as readable text, reducing the impact of a database exposure (OWASP, 2024a).
* **Token-based authentication:** Successful login returns a signed JSON Web Token (JWT). Protected routes verify the token before allowing access, so the API can authenticate requests without sending a password with every request (Jones, Bradley and Sakimura, 2015).
* **Role-based access control:** Client, freelancer, and admin areas are protected by role checks. This follows the principle of least privilege by allowing users to access only the resources intended for their role (NIST, 2020).
* **Input validation:** Registration and login input is validated before controller logic runs. Validation helps reject missing, malformed, or unsafe input and makes API responses more predictable (OWASP, 2024b).
* **HTTPS:** HTTPS encrypts data in transit, including login credentials and JWTs, and helps prevent attackers on the network from reading or modifying requests. Local certificates are used for development testing (IETF, 2018).
* **Security headers:** Helmet adds protective HTTP headers, including Content Security Policy, to reduce browser-based risks such as content injection and clickjacking (Helmet, 2025).
* **Restricted CORS:** Requests are accepted only from the configured frontend origin. This prevents unauthorised browser-based applications from making cross-origin requests to the API (MDN Web Docs, 2025).
* **Request-size limits:** JSON and URL-encoded request bodies are limited to 10 KB. This reduces unnecessary resource consumption from oversized requests (OWASP, 2024c).
* **Generic login errors:** Unknown emails and incorrect passwords return the same message. This makes it harder to discover which email addresses have accounts (OWASP, 2024d).
* **Controlled error handling:** Invalid routes and unexpected errors receive controlled responses instead of exposing internal implementation details.

## References

The following sources support the security principles applied in this project. Accessed 22 August 2026.

* Helmet (2025) *Helmet documentation*. Available at: https://helmetjs.github.io/
* IETF (2018) *The Transport Layer Security (TLS) Protocol Version 1.3 (RFC 8446)*. Available at: https://www.rfc-editor.org/rfc/rfc8446
* Jones, M., Bradley, J. and Sakimura, N. (2015) *JSON Web Token (JWT) (RFC 7519)*. IETF. Available at: https://www.rfc-editor.org/rfc/rfc7519
* MDN Web Docs (2025) *CORS (Cross-Origin Resource Sharing)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
* NIST (2020) *Security and Privacy Controls for Information Systems and Organizations (SP 800-53 Rev. 5)*. Available at: https://doi.org/10.6028/NIST.SP.800-53r5
* OWASP (2024a) *Password Storage Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
* OWASP (2024b) *Input Validation Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
* OWASP (2024c) *Denial of Service Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
* OWASP (2024d) *Authentication Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

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
