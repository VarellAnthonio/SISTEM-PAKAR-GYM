import { apiService } from './api';

export const programService = {
  // Get all programs
  getAll: async (params = {}) => {
    try {
      const response = await apiService.programs.getAll(params);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get programs';
      return {
        success: false,
        message
      };
    }
  },

  // Get program by code (P1, P2, P3, etc.)
  getByCode: async (code) => {
    try {
      const response = await apiService.programs.getByCode(code);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get program';
      return {
        success: false,
        message
      };
    }
  },

  // Get program by ID
  getById: async (id) => {
    try {
      const response = await apiService.programs.getById(id);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get program';
      return {
        success: false,
        message
      };
    }
  },

  // Search programs
  search: async (searchTerm) => {
    try {
      const response = await apiService.programs.getAll({ search: searchTerm });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search programs';
      return {
        success: false,
        message
      };
    }
  },

  // Admin methods
  admin: {
    // Get program statistics
    getStats: async () => {
      try {
        const response = await apiService.programs.getStats();
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to get statistics';
        return {
          success: false,
          message
        };
      }
    },

    // Create new program
    create: async (programData) => {
      try {
        const response = await apiService.programs.create(programData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create program';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Update program
    update: async (id, updateData) => {
      try {
        const response = await apiService.programs.update(id, updateData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update program';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Delete program
    delete: async (id) => {
      try {
        const response = await apiService.programs.delete(id);
        return {
          success: true,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete program';
        return {
          success: false,
          message
        };
      }
    }
  }
};