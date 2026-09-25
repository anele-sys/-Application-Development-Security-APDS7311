import axios from 'axios';

/**
 * HustleHub+ Central Axios API Client
 * Uses Vite dev proxy by default (or VITE_API_URL if explicitly configured).
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hustlehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format errors and handle authentication expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If backend returns 401 Unauthorized (invalid/expired token), clean local storage
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url.includes('/api/auth/login') || error.config.url.includes('/api/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('hustlehub_token');
        localStorage.removeItem('hustlehub_user');
      }
    }

    // Standardize error message extraction
    const customMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred';
    const enhancedError = new Error(customMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;
