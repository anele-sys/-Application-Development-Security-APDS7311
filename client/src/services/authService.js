import apiClient from './api';

/**
 * HustleHub+ Authentication Service Layer
 * Communicates with backend /api/auth endpoints
 */
export const authService = {
  /**
   * Register a new user (Client or Freelancer)
   * @param {Object} userData - { name, email, password, role }
   */
  async register(userData) {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Login an existing user
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Fetch profile of currently authenticated user using JWT
   */
  async getProfile() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  /**
   * Verify Client-Area role access
   */
  async checkClientArea() {
    const response = await apiClient.get('/api/auth/client-area');
    return response.data;
  },

  /**
   * Verify Freelancer-Area role access
   */
  async checkFreelancerArea() {
    const response = await apiClient.get('/api/auth/freelancer-area');
    return response.data;
  },

  /**
   * Verify Admin-Area role access
   */
  async checkAdminArea() {
    const response = await apiClient.get('/api/auth/admin-area');
    return response.data;
  },

  /**
   * Check Backend API Health
   */
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default authService;
