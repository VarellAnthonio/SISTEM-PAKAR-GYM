import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health check
  health: () => api.get('/health'),
  
  // Authentication
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me')
  },

  // Programs
  programs: {
    getAll: (params = {}) => api.get('/programs', { params }),
    getByCode: (code) => api.get(`/programs/${code}`),
    getById: (id) => api.get(`/programs/id/${id}`),
    getStats: () => api.get('/programs/stats'),
    create: (data) => api.post('/programs', data),
    update: (id, data) => api.put(`/programs/${id}`, data),
    delete: (id) => api.delete(`/programs/${id}`)
  },

  // Consultations
  consultations: {
    create: (data) => api.post('/consultations', data),
    getMine: (params = {}) => api.get('/consultations', { params }),
    getById: (id) => api.get(`/consultations/${id}`),
    update: (id, data) => api.put(`/consultations/${id}`, data),
    delete: (id) => api.delete(`/consultations/${id}`),
    
    // Admin endpoints
    admin: {
      getAll: (params = {}) => api.get('/consultations/admin/all', { params }),
      getStats: () => api.get('/consultations/admin/stats')
    }
  },

  // Exercises (when we implement)
  exercises: {
    getAll: (params = {}) => api.get('/exercises', { params }),
    getByCategory: (category) => api.get(`/exercises/category/${category}`),
    getById: (id) => api.get(`/exercises/${id}`),
    create: (data) => api.post('/exercises', data),
    update: (id, data) => api.put(`/exercises/${id}`, data),
    delete: (id) => api.delete(`/exercises/${id}`)
  }
};

export default api;