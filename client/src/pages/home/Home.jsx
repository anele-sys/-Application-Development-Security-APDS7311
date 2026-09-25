import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">
            <span>🛡️</span>
            <span>Enterprise-Grade Security &amp; RBAC</span>
          </div>
          <h1 className="hero-title">
            The Secure Freelance Marketplace for <span>Top Talent &amp; Clients</span>
          </h1>
          <p className="hero-subtitle">
            HustleHub+ empowers freelancers to offer their services securely while providing
            clients with a verified platform to book talent with end-to-end data protection.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link
                to={
                  user?.role === 'freelancer'
                    ? '/freelancer-dashboard'
                    : user?.role === 'admin'
                    ? '/admin-dashboard'
                    : '/client-dashboard'
                }
                className="btn btn-primary btn-lg"
              >
                Go to Your Dashboard ({user?.role}) &rarr;
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Today
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built with Security &amp; Quality First</h2>
            <p className="section-subtitle">
              Designed according to industry standards for secure full-stack web applications.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span style={{ fontSize: '1.4rem' }}>🔐</span>
              </div>
              <h3 className="feature-title">Token-Based Authentication</h3>
              <p className="feature-desc">
                Stateless session security using JSON Web Tokens (JWT) with cryptographic signing,
                preventing unauthorized tampering and credential exposure.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span style={{ fontSize: '1.4rem' }}>👥</span>
              </div>
              <h3 className="feature-title">Role-Based Access Control (RBAC)</h3>
              <p className="feature-desc">
                Strict separation of privileges between Clients, Freelancers, and Administrators
                enforced both at frontend route guards and backend API middleware.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
              </div>
              <h3 className="feature-title">Robust Input Sanitization</h3>
              <p className="feature-desc">
                Comprehensive client-side validation and server-side input sanitization protecting
                against injection, cross-site scripting (XSS), and data corruption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
