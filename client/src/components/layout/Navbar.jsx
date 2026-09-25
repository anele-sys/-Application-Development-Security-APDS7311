import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <span>HustleHub</span>
          <span className="brand-badge">+</span>
        </Link>

        {/* Dynamic Navigation Links based on Role & Auth */}
        <nav>
          <ul className="navbar-nav">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
            </li>

            {isAuthenticated && user?.role === 'client' && (
              <>
                <li>
                  <NavLink
                    to="/client-dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Client Dashboard
                  </NavLink>
                </li>
              </>
            )}

            {isAuthenticated && user?.role === 'freelancer' && (
              <>
                <li>
                  <NavLink
                    to="/freelancer-dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Freelancer Hub
                  </NavLink>
                </li>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <li>
                  <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Admin Console
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Right side authentication actions */}
        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="nav-user-profile">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                </div>
                <span className={`role-badge role-${user.role || 'client'}`}>
                  {user.role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of HustleHub+"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
