// frontend/src/services/user.js - SIMPLIFIED VERSION (View, Toggle, Delete Only)
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

  // Get single user by ID (VIEW ONLY)
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

  // REMOVED: update method - Admin tidak bisa edit user info

  // Delete user (with safety checks)
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

  // Toggle user status (active/inactive)
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

  // Utility methods - SIMPLIFIED
  utils: {
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

    // Check if user can be deleted (safety check)
    canDeleteUser: (user, currentUserId) => {
      // Cannot delete self
      if (user.id === currentUserId) {
        return { canDelete: false, reason: 'Cannot delete your own account' };
      }
      
      // Cannot delete admin accounts
      if (user.role === 'admin') {
        return { canDelete: false, reason: 'Cannot delete administrator accounts' };
      }
      
      return { canDelete: true };
    },

    // Check if user status can be toggled (safety check)
    canToggleStatus: (user, currentUserId) => {
      // Cannot deactivate self
      if (user.id === currentUserId && user.isActive) {
        return { canToggle: false, reason: 'Cannot deactivate your own account' };
      }
      
      // Cannot toggle admin accounts (additional safety)
      if (user.role === 'admin' && user.id !== currentUserId) {
        return { canToggle: false, reason: 'Cannot modify other administrator accounts' };
      }
      
      return { canToggle: true };
    },

    // Get user summary for display
    getUserSummary: (user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        gender: user.gender,
        createdAt: user.createdAt,
        consultationCount: user.consultations ? user.consultations.length : 0,
        displayName: `${user.name} (${user.email})`,
        statusText: user.isActive ? 'Aktif' : 'Nonaktif',
        roleText: user.role === 'admin' ? 'Administrator' : 'User',
        genderIcon: this.getGenderIcon(user.gender),
        genderText: this.getGenderDisplay(user.gender)
      };
    }
  }
};
