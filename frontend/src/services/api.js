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

  // Exercises - FULL CRUD with YouTube integration
  exercises: {
    // Public endpoints (for users)
    getAll: (params = {}) => api.get('/exercises', { params }),
    getById: (id) => api.get(`/exercises/${id}`),
    getByCategory: (category) => api.get(`/exercises/category/${category}`),
    search: (params = {}) => api.get('/exercises/search', { params }),
    
    // Admin endpoints (full CRUD)
    admin: {
      create: (data) => api.post('/exercises', data),
      update: (id, data) => api.put(`/exercises/${id}`, data),
      delete: (id) => api.delete(`/exercises/${id}`),
      getStats: () => api.get('/exercises/stats'),
      bulkCreate: (data) => api.post('/exercises/bulk', data),
      validateYouTube: (url) => api.post('/exercises/validate-youtube', { url }),
      
      // Category management
      getCategories: () => api.get('/exercises/categories'),
      getMuscleGroups: () => api.get('/exercises/muscle-groups'),
      getEquipment: () => api.get('/exercises/equipment'),
      
      // Analytics
      getPopular: (params = {}) => api.get('/exercises/popular', { params }),
      getRecentlyAdded: (params = {}) => api.get('/exercises/recent', { params }),
      getWithoutVideos: (params = {}) => api.get('/exercises/no-videos', { params }),
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
  }
};

export default api;