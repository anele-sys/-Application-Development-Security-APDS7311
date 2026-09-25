# HustleHub+ Frontend Client

HustleHub+ is a secure full-stack freelance marketplace web application developed for **APDS7311 (Application Development Security)**.

This frontend client application is built with **React** and **Vite**, featuring a clean modern UI, centralized API service layer with JWT interceptors, role-based access control (RBAC) route guards, real-time input sanitization & password policy validation, and responsive navigation.

---

## 👥 Frontend Core Architecture

The frontend core encompasses:

1. **React Setup & Build Pipeline**:
   - Modern Vite + React single-page application setup.
   - Fast production builds and HMR development server configured on port `5173`.
   - Vanilla CSS design system tokens with responsive layouts and accessible components.

2. **Client-Side Routing & Protected Routes**:
   - `react-router-dom` declarative routing hierarchy.
   - `<ProtectedRoute />` wrapper providing RBAC authorization checks across `client`, `freelancer`, and `admin` roles.
   - Seamless unauthenticated redirects to `/login` (with preserved return destination) and unauthorized role attempts redirected to `/unauthorized`.

3. **Authentication & Session Management**:
   - `AuthContext` and `useAuth` hook managing global authentication state, token storage, and session validation.
   - Automatic token re-verification on application mount via `GET /api/auth/me`.
   - Robust cleanup upon 401 session expiration.

4. **API Service Layer**:
   - Centralized Axios instance (`client/src/services/api.js`) with request/response interceptors automatically attaching `Authorization: Bearer <token>`.
   - `authService.js` abstraction module for `/api/auth` endpoints (`register`, `login`, `getProfile`, `checkClientArea`, `checkFreelancerArea`, `checkAdminArea`).

5. **Authentication Pages & Real-Time Validation**:
   - **Login (`/login`)**: Email/Password authentication with loading indicators, error alert banners, and role-directed post-login navigation.
   - **Register (`/register`)**: Account registration with interactive Role Selector (`client` vs `freelancer`) and real-time password security criteria verification (8+ chars, uppercase, lowercase, numeric).

6. **Navigation & Dynamic Header**:
   - Responsive `<Navbar />` with brand badge, role-sensitive navigation links, user profile avatar, active role indicator, and sign out control.
   - Universal `<Footer />` reinforcing security posture.

---

## 📁 Directory Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Alert.jsx              # Status and error alert banner
│   │   │   ├── LoadingSpinner.jsx     # Loading feedback spinner
│   │   │   └── ProtectedRoute.jsx     # RBAC Route Guard wrapper
│   │   └── layout/
│   │       ├── Footer.jsx             # Universal footer
│   │       ├── Layout.jsx             # Main layout wrapper
│   │       └── Navbar.jsx             # Responsive dynamic navigation
│   ├── context/
│   │   └── AuthContext.jsx            # Global auth state & user session
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx              # Sign-in view
│   │   │   └── Register.jsx           # Registration view with role toggle
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx     # Admin console view
│   │   │   ├── ClientDashboard.jsx    # Client portal & gig browser hook
│   │   │   └── FreelancerDashboard.jsx# Freelancer studio & listing hook
│   │   ├── home/
│   │   │   └── Home.jsx               # Landing page
│   │   └── misc/
│   │       ├── NotFound.jsx           # 404 handler
│   │       └── Unauthorized.jsx       # 403 Forbidden handler
│   ├── services/
│   │   ├── api.js                     # Axios client with JWT interceptor
│   │   └── authService.js             # Authentication API service layer
│   ├── App.jsx                        # Route table configuration
│   ├── index.css                      # Design system & CSS tokens
│   └── main.jsx                       # React entrypoint
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### 1. Install Dependencies
Navigate into the `client` directory:
```bash
cd client
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` if you wish to override the API server URL:
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `client/dist/`.
