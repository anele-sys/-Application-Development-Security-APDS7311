import apiClient from './api';

const bookingService = {
  /**
   * Client initiates booking for a gig with simulated payment
   */
  async create(bookingData) {
    const response = await apiClient.post('/api/bookings', bookingData);
    return response.data;
  },

  /**
   * Fetch all bookings for the authenticated Client
   */
  async getClientBookings() {
    const response = await apiClient.get('/api/bookings/client');
    return response.data;
  },

  /**
   * Fetch all bookings received by the authenticated Freelancer
   */
  async getFreelancerBookings() {
    const response = await apiClient.get('/api/bookings/freelancer');
    return response.data;
  },

  /**
   * Fetch single booking details
   */
  async getById(id) {
    const response = await apiClient.get(`/api/bookings/${id}`);
    return response.data;
  },

  /**
   * Update booking status
   */
  async updateStatus(id, status) {
    const response = await apiClient.patch(`/api/bookings/${id}/status`, { status });
    return response.data;
  },

  /**
   * Admin: Fetch all platform bookings & transaction volume
   */
  async getAdminAll() {
    const response = await apiClient.get('/api/bookings/admin/all');
    return response.data;
  },

  /**
   * Freelancer: Fetch aggregated income, category metrics, and SARS tax analytics
   */
  async getIncomeAnalytics(deductions = 0) {
    const response = await apiClient.get('/api/bookings/freelancer/income-analytics', {
      params: { deductions },
    });
    return response.data;
  },

  /**
   * Freelancer: Simulate tax scenario with custom income and deductions
   */
  async simulateTax(data) {
    const response = await apiClient.post('/api/bookings/freelancer/tax-simulate', data);
    return response.data;
  },
};

export default bookingService;
