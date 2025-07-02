import { apiService } from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, data: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || [];
      return { success: false, message, errors };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiService.auth.login(credentials);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, data: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call logout endpoint if possible
      try {
        await apiService.auth.logout();
      } catch (error) {
        // Ignore API errors during logout
        console.warn('Logout API call failed:', error.message);
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user info from API
  getMe: async () => {
    try {
      const response = await apiService.auth.getMe();
      
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return { success: true, data: response.data.data };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      // Re-throw the error so AuthContext can handle 401s properly
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      return null;
    }
  },

  // Validate current authentication with server
  validateAuth: async () => {
    try {
      if (!authService.isAuthenticated()) {
        return false;
      }

      const response = await authService.getMe();
      return response && response.success;
    } catch (error) {
      console.error('Auth validation error:', error);
      
      // If it's a 401, token is invalid
      if (error.response?.status === 401) {
        await authService.logout();
        return false;
      }
      
      // For other errors, assume auth is still valid
      return true;
    }
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Update stored user data
  updateStoredUser: (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error updating stored user data:', error);
    }
  },

  // Check if token exists and is not expired (basic check)
  hasValidToken: () => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      // Basic JWT structure check (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiry (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < now) {
        console.log('Token is expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },

  // Check if user is admin
  isAdmin: () => {
    return authService.getUserRole() === 'admin';
  },

  // Check if user is regular user
  isUser: () => {
    return authService.getUserRole() === 'user';
  }
};