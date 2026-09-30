import apiClient from './api';

const gigService = {
  async getAll() {
    const response = await apiClient.get('/api/gigs');
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/api/gigs/${id}`);
    return response.data;
  },

  async getMine() {
    const response = await apiClient.get('/api/gigs/mine');
    return response.data;
  },

  async create(gigData) {
    const response = await apiClient.post('/api/gigs', gigData);
    return response.data;
  },

  async update(id, gigData) {
    const response = await apiClient.put(`/api/gigs/${id}`, gigData);
    return response.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/api/gigs/${id}`);
    return response.data;
  }
};

export default gigService;