import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute: Route Guard for authentication and Role-Based Access Control (RBAC)
 * @param {Array<string>} allowedRoles - Optional list of authorized roles (e.g. ['client', 'freelancer', 'admin'])
 * @param {ReactNode} children - Component to render if access is permitted
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  // If user is not authenticated, redirect to login while preserving target route
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role does not match, redirect to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
