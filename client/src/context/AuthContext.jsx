import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hustlehub_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('hustlehub_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify authentication state on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('hustlehub_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('hustlehub_user', JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, clearing auth:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email, password });
    if (response.success && response.token) {
      localStorage.setItem('hustlehub_token', response.token);
      localStorage.setItem('hustlehub_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error(response.message || 'Login failed');
  }, []);

  // Register handler
  const register = useCallback(async (name, email, password, role) => {
    const response = await authService.register({ name, email, password, role });
    return response;
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('hustlehub_token');
    localStorage.removeItem('hustlehub_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
    hasRole: (role) => user?.role === role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume the AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
