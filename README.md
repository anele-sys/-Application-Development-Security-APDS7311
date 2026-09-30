# HustleHub+ Secure Full-Stack Application (APDS7311)

## Project Overview

**HustleHub+** is a secure, role-based freelance marketplace platform built with a Node.js/Express HTTPS backend and a modern React frontend. Freelancers can publish, update, and manage service listings, while clients can browse the marketplace and initiate bookings. The system simulates payment confirmation and generates verifiable transaction records, tracking client expenditures and freelancer earnings with strict security controls and privacy guarantees.

---

## Intended Users & Role-Based Access Control (RBAC)

The application enforces strict separation of privileges across three user roles:

* **Clients:** Register, log in, browse marketplace gigs by keyword and category, initiate bookings with simulated payment checkout, view order histories and transaction receipts, and track total spend.
* **Freelancers:** Register, log in, manage their own gig listings (create, edit, delete, toggle active/inactive status), review received client orders, update project delivery status (e.g., in progress, completed, cancelled), and track total earned income.
* **Administrators:** Provisioned privately via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), manage privileged system-wide operations, audit all transactions, inspect platform volume, and monitor security health metrics.

Users cannot access, modify, or delete resources that do not belong to them.

---

## Key Application Features

### 1. Gig Management
* **Freelancer Control:** Freelancers create, update, and delete service listings.
* **Granular Ownership:** The backend strictly checks `gig.owner === req.user.id` on update and delete operations.
* **Marketplace Discovery:** Public and authenticated clients can browse active gigs with real-time search and category filtering.

### 2. Booking & Simulated Transactions
* **Simulated Checkout:** Clients initiate bookings using simulated payment options (Card Demo, Instant EFT, Demo Balance). No real credit card or bank credentials are required.
* **Transaction Records:** Each booking creates an immutable transaction record (`transactionId`, `amount`, `currency`, `paymentMethod`, `status`, `paidAt`).
* **Self-Booking Prevention:** Freelancers are prevented from booking their own gigs.
* **Income & Spend Tracking:** The system calculates cumulative earnings for freelancers and aggregate spending for clients.

### 3. Frontend Architecture (React)
* **Single-Page Application (SPA):** Built with React, Vite, and React Router.
* **Clean UI & Responsive Aesthetics:** Designed with custom CSS variables, accessible color contrasts, responsive grids, and micro-animations.
* **Session Persistence:** State managed via React Context (`AuthContext`) with automatic token verification against `/api/auth/me`.

---

## Security Implementation

* **HTTPS / TLS 1.3:** Encrypted in-transit communication with local certificates.
* **Stateless JWT Authentication:** Cryptographically signed tokens using `HS256` with configurable expiry (`1h`).
* **Role-Based Access Control (RBAC):** Backend route guards (`requireRole`) and frontend protected routes (`ProtectedRoute`) prevent privilege escalation.
* **Input Sanitization & Injection Prevention:** Inputs are trimmed, script tags stripped, and angle brackets sanitized before reaching business logic.
* **Targeted Rate Limiting:**
  * Global API Limiter: 100 requests per 15-minute window (`/api`).
  * Authentication Limiter: Protects `/api/auth/login` from brute-force attempts while skipping successful logins to avoid session lockouts.
  * Booking Limiter: Prevents transaction flooding on `POST /api/bookings`.
* **Security Headers (Helmet):** Configures Content Security Policy (CSP), frame options (anti-clickjacking), and cross-origin resource isolation.
* **CORS Protection:** Rejects cross-origin requests originating outside the configured `CLIENT_ORIGIN`.
* **Password Hashing:** Passwords hashed with `bcryptjs` (salt rounds: 12).
* **Safe Error Handling:** Generic authentication messages prevent user enumeration, and application error details are obscured from client responses.

---

## Project Structure

```
.
├── api/
│   ├── certs/                 # SSL certificate and private key
│   ├── postman/               # Postman collection & environment for Newman
│   ├── src/
│   │   ├── config/            # MongoDB connection
│   │   ├── controllers/       # Auth, Gig, and Booking business logic
│   │   ├── middleware/        # Auth, RBAC, Rate limiting, Input validation, Error handler
│   │   ├── models/            # Mongoose schemas (User, Gig, Booking)
│   │   ├── routes/            # Express routers (/api/auth, /api/gigs, /api/bookings)
│   │   └── utils/             # JWT helpers and input sanitizers
│   └── tests/                 # Jest & Supertest automated backend test suites
│
├── client/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, BookingModal, Marketplace, ProtectedRoute
│   │   ├── context/           # AuthContext & session state provider
│   │   ├── pages/             # Home, Login, Register, Client/Freelancer/Admin Dashboards
│   │   ├── services/          # Central Axios client and API services (auth, gig, booking)
│   │   ├── test/              # Vitest & Testing Library frontend component tests
│   │   └── index.css          # Design system styles and responsive layout
│   └── vite.config.js         # Vite configuration with HTTPS proxy and Vitest setup
│
└── README.md
```

---

## Setup & Running Instructions

### 1. Prerequisites
* **Node.js** (v18 or higher) and **npm**
* **MongoDB** instance (local server or MongoDB Atlas URI)
* **OpenSSL** (for generating local SSL certificates)

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
# Server Configuration
PORT=4000
APP_NAME=HustleHub
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# HTTPS Configuration
USE_HTTPS=true
SSL_KEY_PATH=api/certs/localhost-key.pem
SSL_CERT_PATH=api/certs/localhost-cert.pem

# JWT Configuration
JWT_SECRET=your_secure_random_64_byte_string_here
JWT_EXPIRES_IN=1h
SALT_ROUNDS=12

# Admin Credentials (Development Provisioning)
ADMIN_NAME=HustleHub Administrator
ADMIN_EMAIL=admin@hustlehub.local
ADMIN_PASSWORD=AdminPassword123!

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hustlehub
```

### 3. Generate Local SSL Certificates (If Not Present)
From the root directory:
```bash
cd api/certs
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 -keyout localhost-key.pem -out localhost-cert.pem -subj "/CN=localhost"
cd ../..
```

### 4. Install Dependencies
```bash
# Install backend dependencies
cd api && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 5. Running the Application

**Terminal 1 — Start the Backend Server:**
```bash
cd api
npm run dev
```
The API starts securely at `https://localhost:4000`.

**Terminal 2 — Start the Frontend Client:**
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser. The Vite development server proxies API requests to `https://localhost:4000` automatically.

---

## Testing Procedures

### 1. Backend Automated Tests (Jest & Supertest)
Runs unit and integration tests covering authentication validation, gig ownership, and booking transactions:
```bash
cd api
npm test
```
To generate a code coverage report:
```bash
npm run test:coverage
```

### 2. Frontend Automated Tests (Vitest & React Testing Library)
Runs automated UI tests verifying component rendering, input validation, role selection, and user interactions:
```bash
cd client
npm test
```

### 3. Postman / Newman API Integration Tests
Runs the end-to-end API collection through Newman:
```bash
cd api
npm run test:api
```

---

## API Endpoints Summary

### Authentication (`/api/auth`)
* `GET /api/auth/status` — API status and supported roles.
* `POST /api/auth/register` — Register a client or freelancer account.
* `POST /api/auth/login` — Authenticate and receive signed JWT (rate-limited).
* `GET /api/auth/me` — Retrieve current authenticated user session (JWT required).
* `GET /api/auth/client-area` — Client RBAC verification.
* `GET /api/auth/freelancer-area` — Freelancer RBAC verification.
* `GET /api/auth/admin-area` — Admin RBAC verification.

### Gigs (`/api/gigs`)
* `GET /api/gigs` — Browse all active marketplace gigs.
* `GET /api/gigs/:id` — View single gig details.
* `GET /api/gigs/mine` — View all gigs owned by authenticated freelancer (Freelancer only).
* `POST /api/gigs` — Create a new service listing (Freelancer only).
* `PUT /api/gigs/:id` — Update own gig listing (Freelancer only).
* `DELETE /api/gigs/:id` — Delete own gig listing (Freelancer only).

### Bookings & Transactions (`/api/bookings`)
* `POST /api/bookings` — Book a gig with simulated payment (Client only, rate-limited).
* `GET /api/bookings/client` — View client's bookings and spend stats (Client only).
* `GET /api/bookings/freelancer` — View received orders and earned income (Freelancer only).
* `GET /api/bookings/admin/all` — Platform-wide transaction audit (Admin only).
* `GET /api/bookings/:id` — View booking details (Authorized users only).
* `PATCH /api/bookings/:id/status` — Update order status (in_progress, completed, cancelled).

---

## References

* **Helmet (2025)** *Helmet security documentation*. Available at: https://helmetjs.github.io/
* **IETF (2018)** *The Transport Layer Security (TLS) Protocol Version 1.3 (RFC 8446)*. Available at: https://www.rfc-editor.org/rfc/rfc8446
* **Jones, M., Bradley, J. and Sakimura, N. (2015)** *JSON Web Token (JWT) (RFC 7519)*. IETF. Available at: https://www.rfc-editor.org/rfc/rfc7519
* **MDN Web Docs (2025)** *CORS (Cross-Origin Resource Sharing)*. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
* **NIST (2020)** *Security and Privacy Controls for Information Systems and Organizations (SP 800-53 Rev. 5)*. Available at: https://doi.org/10.6028/NIST.SP.800-53r5
* **OWASP (2024a)** *Password Storage Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
* **OWASP (2024b)** *Input Validation Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
* **OWASP (2024c)** *Denial of Service Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
* **OWASP (2024d)** *Authentication Cheat Sheet*. Available at: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
