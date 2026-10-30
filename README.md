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

### 4. Freelancer Financial Intelligence & Tax Engine
* **Automated Income Aggregation:** Tracks realized revenue from completed contracts and pending income from in-progress orders.
* **SARS Progressive Tax Estimation:** Calculates accurate statutory income tax obligations based on South African Revenue Service (SARS) progressive tax brackets.
* **Marginal vs. Effective Rate Analysis:** Dynamically differentiates between marginal bracket tiers and the actual effective tax percentage.
* **Visual Financial Dashboards:** Interactive monthly revenue-versus-tax trend charts and service category distribution visualizations.
* **Provisional Tax Deadlines (IRP6):** Automatically breaks down bi-annual provisional tax payments for August and February.
* **Interactive Expense Simulator:** Freelancers can simulate Section 11(a) business expense deductions in real-time to preview tax savings and optimize filings.

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
│   │   ├── controllers/       # Auth, Gig, Booking, and Tax Analytics logic
│   │   ├── middleware/        # Auth, RBAC, Rate limiting, Input validation, Error handler
│   │   ├── models/            # Mongoose schemas (User, Gig, Booking)
│   │   ├── routes/            # Express routers (/api/auth, /api/gigs, /api/bookings)
│   │   └── utils/             # Tax calculator, JWT helpers, and input sanitizers
│   └── tests/                 # Jest & Supertest automated backend test suites (30 tests)
│
├── client/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, BookingModal, Marketplace, IncomeTaxDashboard
│   │   ├── context/           # AuthContext & session state provider
│   │   ├── pages/             # Home, Login, Register, Client/Freelancer/Admin Dashboards
│   │   ├── services/          # Central Axios client and API services (auth, gig, booking)
│   │   ├── test/              # Vitest & Testing Library frontend component tests (12 tests)
│   │   └── index.css          # Design system styles, chart visuals, and print stylesheet
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
# Install root orchestration tools, backend, and frontend dependencies:
npm run install:all
```
*(Or manually run `npm install` in the root, `cd api && npm install`, and `cd client && npm install`)*.

### 5. Running the Application

**Option A (Recommended) — Run Full Stack with a Single Command:**
From the root directory:
```bash
npm run dev
```
This concurrently starts both the **Backend API** (`https://localhost:4000`) and the **Vite Frontend Client** (`http://localhost:5173`) in a unified terminal with color-coded log streams.

**Option B — Run Separately in Individual Terminals:**
* **Terminal 1 (Backend Server):**
  ```bash
  cd api && npm run dev
  ```
* **Terminal 2 (Frontend Client):**
  ```bash
  cd client && npm run dev
  ```

Open `http://localhost:5173` in your browser. The Vite development server proxies API requests to `https://localhost:4000` automatically.

---

## Testing Procedures

### 1. Backend Automated Tests (Jest & Supertest)
Runs 30 unit and integration tests covering authentication validation, gig ownership, booking transactions, and the SARS progressive tax calculation engine:
```bash
cd api
npm test
```
To generate a code coverage report:
```bash
npm run test:coverage
```

### 2. Frontend Automated Tests (Vitest & React Testing Library)
Runs 12 automated UI tests verifying component rendering, input validation, role selection, booking modals, and the interactive income/tax dashboard:
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
* `GET /api/bookings/freelancer/income-analytics` — Comprehensive revenue aggregation, monthly timeline, category distribution, and SARS tax breakdown (Freelancer only).
* `POST /api/bookings/freelancer/tax-simulate` — Interactive real-time scenario simulation for custom revenue and deductible business expenses (Freelancer only).
* `GET /api/bookings/admin/all` — Platform-wide transaction audit (Admin only).
* `GET /api/bookings/:id` — View booking details (Authorized users only).
* `PATCH /api/bookings/:id/status` — Update order status (in_progress, completed, cancelled).

---

## Tax Estimation Logic & Financial Insights

### 1. Theoretical Foundation & Legal Context
In South Africa, freelancers, sole proprietors, and independent contractors earn taxable income subject to the **South African Revenue Service (SARS) Individual Income Tax** framework. Unlike formal employees whose taxes are withheld monthly at source via Pay-As-You-Earn (PAYE), freelancers operate under a self-assessment and **Provisional Tax** regime (governed by the Fourth Schedule to the Income Tax Act No. 58 of 1962).

HustleHub+ embeds an automated tax calculation engine (`api/src/utils/taxCalculator.js`) and client-side intelligence dashboard (`client/src/components/dashboard/IncomeTaxDashboard.jsx`) to bridge the gap between platform gig revenues and statutory compliance.

### 2. SARS Progressive Tax Brackets (2024 / 2025 / 2026)
South Africa operates on a **progressive marginal tax system**. Taxpayers only pay the marginal rate on the portion of income that falls within that specific bracket:

| Tax Bracket Tier | Taxable Income Range (ZAR) | Statutory Rate of Tax |
|:---|:---|:---|
| **Tier 1** | R0 – R237,100 | 18% of taxable income |
| **Tier 2** | R237,101 – R370,500 | R42,678 + 26% of taxable income above R237,100 |
| **Tier 3** | R370,501 – R512,800 | R77,362 + 31% of taxable income above R370,500 |
| **Tier 4** | R512,801 – R673,000 | R121,475 + 36% of taxable income above R512,800 |
| **Tier 5** | R673,001 – R857,900 | R179,147 + 39% of taxable income above R673,000 |
| **Tier 6** | R857,901 – R1,817,000 | R251,258 + 41% of taxable income above R857,900 |
| **Tier 7** | R1,817,001 and above | R644,489 + 45% of taxable income above R1,817,000 |

### 3. Statutory Rebates and Tax-Free Threshold
Under Section 6 of the Income Tax Act, all individual taxpayers under the age of 65 qualify for an annual **Primary Tax Rebate**:
* **Primary Tax Rebate:** **R17,235.00** per annum.
* **Tax-Free Threshold:** **R95,750.00** ($\text{R17,235} \div 0.18 = \text{R95,750}$).

If a freelancer's annual taxable income is R95,750 or below, their gross tax liability is completely cancelled out by the primary rebate, resulting in **R0 net tax payable**.

### 4. Mathematical Calculation Formula
For any given gross platform income ($G$) and allowable business expenses ($D$):

$$\text{Taxable Income } (Y) = \max(0, G - D)$$

Using the active bracket where $Y \in (\text{Bracket Min}, \text{Bracket Max}]$:

$$\text{Gross Tax } (T_{\text{gross}}) = \text{Base Tax} + (Y - \text{Bracket Floor}) \times \text{Marginal Rate}$$

Applying the primary statutory rebate ($R = \text{R17,235}$):

$$\text{Net Tax Payable } (T_{\text{net}}) = \max(0, T_{\text{gross}} - R)$$

The **Effective Tax Rate** ($E$) and **Net Take-Home Pay** ($N$) are derived as:

$$E = \left(\frac{T_{\text{net}}}{G}\right) \times 100\% \quad \text{and} \quad N = G - T_{\text{net}}$$

### 5. Step-by-Step Worked Mathematical Example
Assume a freelancer generates **R300,000.00** in gross completed bookings with **R20,000.00** in deductible business expenses (s11(a)):
1. **Taxable Income:** $\text{R300,000} - \text{R20,000} = \text{R280,000.00}$.
2. **Bracket Identification:** R280,000 falls in **Tier 2** (R237,101 to R370,500).
   * Base Tax = R42,678.00
   * Bracket Floor = R237,100.00
   * Marginal Rate = 26% (0.26)
3. **Marginal Portion:** $\text{R280,000} - \text{R237,100} = \text{R42,900.00}$.
4. **Marginal Tax:** $\text{R42,900} \times 0.26 = \text{R11,154.00}$.
5. **Gross Statutory Tax:** $\text{R42,678.00} + \text{R11,154.00} = \text{R53,832.00}$.
6. **Apply Primary Rebate:** $\text{R53,832.00} - \text{R17,235.00} = \text{R36,597.00}$ Net Tax Payable.
7. **Effective Tax Rate:** $\frac{\text{R36,597}}{\text{R300,000}} \times 100\% = \mathbf{12.20\%}$.
8. **Net Take-Home Earnings:** $\text{R300,000.00} - \text{R36,597.00} = \mathbf{R263,403.00}$.

### 6. Provisional Tax Milestones (IRP6)
Freelancers do not experience PAYE deductions at source. Instead, the application computes semi-annual provisional tax payments:
* **Period 1 (due 31 August):** 50% of total estimated annual tax liability ($T_{\text{net}} \times 0.5$).
* **Period 2 (due 28/29 February):** Remaining 50% reconciled against total actual earnings.

### 7. Frontend Financial Insights & Interactive Visualizations
The Freelancer Studio includes a dedicated **Tax & Financial Insights** dashboard featuring:
* **KPI Metrics:** Gross Earnings, Realized vs. Pending revenue, Estimated Tax Liability, Net Take-Home Pay, and Effective Tax Rate.
* **Monthly Revenue & Tax Trend Chart:** Pure React SVG chart comparing monthly revenue, tax provisions, and net retained income.
* **SARS Progressive Bracket Visualizer:** Interactive table and progress indicators showing how much income falls into each statutory tier and which marginal bracket is currently active.
* **Income by Service Category:** Revenue distribution across gig offerings (Web Development, UI/UX, Security, etc.).
* **Provisional Tax Tracker:** Real-time milestone dates and payment projections.
* **Interactive Tax & Expense Simulator:** Sliders and numerical inputs allowing freelancers to test scenario earnings and Section 11(a) business expense deductions to see instant tax savings.
* **Print & Export Capability:** Formatted layout ready for physical print or PDF export for accounting records.

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
* **SARS (2024)** *Rates of Tax for Individuals (2024/2025/2026 Tax Years)*. South African Revenue Service. Available at: https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/
* **SARS (2024)** *Provisional Tax: External Guide (GEN-PT-01-G01)*. South African Revenue Service. Available at: https://www.sars.gov.za/types-of-tax/provisional-tax/
* **Republic of South Africa (1962)** *Income Tax Act No. 58 of 1962, as amended*. Government Gazette.
