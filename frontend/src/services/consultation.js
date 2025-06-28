import { apiService } from './api';

export const consultationService = {
  // Create new consultation with forward chaining
  create: async (consultationData) => {
    try {
      const response = await apiService.consultations.create(consultationData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create consultation';
      const errors = error.response?.data?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  },

  // Get user's consultations with pagination
  getUserConsultations: async (params = {}) => {
    try {
      const response = await apiService.consultations.getMine(params);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get consultations';
      return {
        success: false,
        message
      };
    }
  },

  // Get specific consultation
  getById: async (id) => {
    try {
      const response = await apiService.consultations.getById(id);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get consultation';
      return {
        success: false,
        message
      };
    }
  },

  // Update consultation
  update: async (id, updateData) => {
    try {
      const response = await apiService.consultations.update(id, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update consultation';
      return {
        success: false,
        message
      };
    }
  },

  // Delete consultation
  delete: async (id) => {
    try {
      const response = await apiService.consultations.delete(id);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete consultation';
      return {
        success: false,
        message
      };
    }
  },

  // Admin methods
  admin: {
    // Get all consultations
    getAll: async (params = {}) => {
      try {
        const response = await apiService.consultations.admin.getAll(params);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to get consultations';
        return {
          success: false,
          message
        };
      }
    },

    // Get consultation statistics
    getStats: async () => {
      try {
        const response = await apiService.consultations.admin.getStats();
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
    }
  }
};