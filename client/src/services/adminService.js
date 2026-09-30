import apiClient from './api';

const adminService = {
  /**
   * Fetch platform aggregate analytics
   */
  async getAnalytics() {
    const response = await apiClient.get('/api/admin/analytics');
    return response.data;
  },

  /**
   * Fetch all registered users with optional search/role filters
   */
  async getUsers(params = {}) {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data;
  },

  /**
   * Update user account role
   */
  async updateUserRole(id, role) {
    const response = await apiClient.patch(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Delete user account and associated gigs
   */
  async deleteUser(id) {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  /**
   * Fetch all platform gigs (active & inactive)
   */
  async getGigs(params = {}) {
    const response = await apiClient.get('/api/admin/gigs', { params });
    return response.data;
  },

  /**
   * Admin update any gig
   */
  async updateGig(id, gigData) {
    const response = await apiClient.put(`/api/admin/gigs/${id}`, gigData);
    return response.data;
  },

  /**
   * Admin delete any gig
   */
  async deleteGig(id) {
    const response = await apiClient.delete(`/api/admin/gigs/${id}`);
    return response.data;
  },
};

export default adminService;
