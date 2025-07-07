// frontend/src/services/user.js
import { apiService } from './api';

export const userService = {
  // Get all users with filters and pagination
  getAll: async (params = {}) => {
    try {
      const response = await apiService.users.getAll(params);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get users';
      return {
        success: false,
        message,
        data: { 
          users: [], 
          pagination: { 
            total: 0, 
            page: 1, 
            totalPages: 0,
            limit: params.limit || 10
          } 
        }
      };
    }
  },

  // Get single user by ID
  getById: async (id) => {
    try {
      const response = await apiService.users.getById(id);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get user';
      return {
        success: false,
        message
      };
    }
  },

  // Update user
  update: async (id, userData) => {
    try {
      const response = await apiService.users.update(id, userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      const errors = error.response?.data?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      const response = await apiService.users.delete(id);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      return {
        success: false,
        message
      };
    }
  },

  // Toggle user status
  toggleStatus: async (id) => {
    try {
      const response = await apiService.users.toggleStatus(id);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle user status';
      return {
        success: false,
        message
      };
    }
  },

  // Get user statistics
  getStats: async () => {
    try {
      const response = await apiService.users.getStats();
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get user statistics';
      return {
        success: false,
        message
      };
    }
  },

  // Reset user password
  resetPassword: async (id, newPassword) => {
    try {
      const response = await apiService.users.resetPassword(id, { newPassword });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      return {
        success: false,
        message
      };
    }
  },

  // Change user role
  changeRole: async (id, role) => {
    try {
      const response = await apiService.users.changeRole(id, role);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change user role';
      return {
        success: false,
        message
      };
    }
  },

  // Utility methods
  utils: {
    // Validate user data
    validateUserData: (userData) => {
      const errors = [];

      if (userData.name && userData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
      }

      if (userData.email && !this.isValidEmail(userData.email)) {
        errors.push('Please provide a valid email');
      }

      if (userData.role && !['user', 'admin'].includes(userData.role)) {
        errors.push('Role must be either user or admin');
      }

      if (userData.gender && !['male', 'female'].includes(userData.gender)) {
        errors.push('Gender must be either male or female');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Email validation
    isValidEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Get gender icon
    getGenderIcon: (gender) => {
      return gender === 'male' ? '👨' : '👩';
    },

    // Get gender display
    getGenderDisplay: (gender) => {
      return gender === 'male' ? 'Laki-laki' : 'Perempuan';
    },

    // Get role badge color
    getRoleBadgeColor: (role) => {
      return role === 'admin' 
        ? 'bg-purple-100 text-purple-800 border-purple-200' 
        : 'bg-blue-100 text-blue-800 border-blue-200';
    },

    // Get status badge color
    getStatusBadgeColor: (isActive) => {
      return isActive 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-red-100 text-red-800 border-red-200';
    },

    // Format date
    formatDate: (dateString) => {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    },

    // Format relative time
    formatRelativeTime: (dateString) => {
      if (!dateString) return 'Never';
      
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
      } catch (error) {
        return 'Unknown';
      }
    },

    // Clean user data for API
    cleanUserData: (userData) => {
      const cleaned = {};
      
      if (userData.name !== undefined) cleaned.name = userData.name.trim();
      if (userData.email !== undefined) cleaned.email = userData.email.trim().toLowerCase();
      if (userData.role !== undefined) cleaned.role = userData.role;
      if (userData.isActive !== undefined) cleaned.isActive = userData.isActive;
      if (userData.gender !== undefined) cleaned.gender = userData.gender;
      
      return cleaned;
    }
  }
};