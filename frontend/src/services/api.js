// frontend/src/services/api.js - COMPLETE VERSION
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

  // Programs - EDIT ONLY (no create/delete)
  programs: {
    getAll: (params = {}) => api.get('/programs', { params }),
    getById: (id) => api.get(`/programs/id/${id}`),
    getStats: () => api.get('/programs/stats'),
    
    // ONLY UPDATE allowed - no create/delete
    update: (id, data) => api.put(`/programs/${id}`, data),
  },

  // Rules - SIMPLIFIED ENDPOINTS (assignment only)
  rules: {
    getAll: (params = {}) => api.get('/rules', { params }),
    getById: (id) => api.get(`/rules/${id}`),
    getStats: () => api.get('/rules/stats'),
    getMissingCombinations: () => api.get('/rules/missing-combinations'),
    
    // ONLY UPDATE allowed (program assignment only)
    update: (id, data) => api.put(`/rules/${id}`, data),
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

  // Exercises - FIXED with proper status management
  exercises: {
    // Public endpoints (for users)
    getAll: (params = {}) => api.get('/exercises', { params }),
    getById: (id) => api.get(`/exercises/${id}`),
    getByCategory: (category) => api.get(`/exercises/category/${category}`),
    getCategories: () => api.get('/exercises/categories'),
    search: (params = {}) => api.get('/exercises', { params }),
    
    // Admin endpoints (full CRUD)
    create: (data) => api.post('/exercises', data),
    update: (id, data) => api.put(`/exercises/${id}`, data),
    delete: (id) => api.delete(`/exercises/${id}`),
    
    // FIXED: Status management endpoints
    toggleStatus: (id) => api.patch(`/exercises/${id}/toggle`),  // Toggle current status
    updateStatus: (id, data) => api.patch(`/exercises/${id}/status`, data),  // Set specific status
    
    // Admin statistics and management
    getStats: () => api.get('/exercises/admin/stats'),
    
    // Admin-only endpoints (alternative structure)
    admin: {
      create: (data) => api.post('/exercises', data),
      update: (id, data) => api.put(`/exercises/${id}`, data),
      delete: (id) => api.delete(`/exercises/${id}`),
      toggleStatus: (id) => api.patch(`/exercises/${id}/toggle`),
      updateStatus: (id, data) => api.patch(`/exercises/${id}/status`, data),
      getStats: () => api.get('/exercises/admin/stats'),
      getCategories: () => api.get('/exercises/categories'),
    }
  },

  // User preferences (for favorites, progress tracking, etc.)
  userPreferences: {
    getFavorites: () => api.get('/user/favorites'),
    addFavorite: (exerciseId) => api.post('/user/favorites', { exerciseId }),
    removeFavorite: (exerciseId) => api.delete(`/user/favorites/${exerciseId}`),
    
    // Workout history
    getWorkoutHistory: (params = {}) => api.get('/user/workout-history', { params }),
    logWorkout: (data) => api.post('/user/workout-history', data),
    
    // Progress tracking
    getProgress: (exerciseId) => api.get(`/user/progress/${exerciseId}`),
    updateProgress: (exerciseId, data) => api.post(`/user/progress/${exerciseId}`, data),
  },

  // Users management (Admin only)
  users: {
    getAll: (params = {}) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    toggleStatus: (id) => api.patch(`/users/${id}/toggle`),
    getStats: () => api.get('/users/stats'),
    
    // User management
    resetPassword: (id) => api.post(`/users/${id}/reset-password`),
    changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  },

  // System utilities
  system: {
    getHealth: () => api.get('/health'),
    getStats: () => api.get('/stats'),
    getDatabaseStatus: () => api.get('/database/status'),
    runMigrations: () => api.post('/database/migrate'),
    seedDatabase: () => api.post('/database/seed'),
    
    // Backup and restore
    exportData: () => api.get('/export'),
    importData: (data) => api.post('/import', data),
  },

  // File upload utilities (if needed)
  files: {
    upload: (file, type = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      return api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    delete: (filename) => api.delete(`/files/${filename}`),
    getUrl: (filename) => `${api.defaults.baseURL}/files/${filename}`,
  },

  // Forward chaining testing (if needed)
  forwardChaining: {
    test: (data) => api.post('/forward-chaining/test', data),
    validate: (conditions) => api.post('/forward-chaining/validate', conditions),
    getRules: () => api.get('/forward-chaining/rules'),
    getPrograms: () => api.get('/forward-chaining/programs'),
  }
};

export default api;