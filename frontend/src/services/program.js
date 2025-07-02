import { apiService } from './api';

export const programService = {
  // Get all programs (READ ONLY)
  getAll: async (params = {}) => {
    try {
      const response = await apiService.programs.getAll(params);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get programs';
      return {
        success: false,
        message
      };
    }
  },

  // Get program by ID (READ ONLY)
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

  // Search programs (READ ONLY)
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

  // Admin methods - EDIT ONLY (no create/delete)
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

    // Update program CONTENT ONLY
    update: async (id, updateData) => {
      try {
        // Filter only allowed fields on client side
        const allowedFields = [
          'name',
          'description', 
          'cardioRatio',
          'dietRecommendation',
          'schedule',
          'isActive'
        ];
        
        const filteredData = {};
        Object.keys(updateData).forEach(key => {
          if (allowedFields.includes(key)) {
            filteredData[key] = updateData[key];
          }
        });

        // Warn about blocked fields
        const blockedFields = ['code', 'bmiCategory', 'bodyFatCategory'];
        const blockedAttempts = blockedFields.filter(field => updateData[field] !== undefined);
        
        if (blockedAttempts.length > 0) {
          console.warn('Attempted to modify protected fields:', blockedAttempts);
        }

        const response = await apiService.programs.update(id, filteredData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
          updatedFields: response.data.updatedFields
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

    // Validate update data (client-side)
    validateUpdate: (updateData) => {
      const errors = [];
      
      // Check required fields
      if (updateData.name && updateData.name.trim().length < 3) {
        errors.push('Program name must be at least 3 characters');
      }

      // Check schedule if provided
      if (updateData.schedule) {
        const requiredDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const providedDays = Object.keys(updateData.schedule);
        const missingDays = requiredDays.filter(day => !providedDays.includes(day));
        
        if (missingDays.length > 0) {
          errors.push(`Missing schedule for days: ${missingDays.join(', ')}`);
        }

        // Check if at least one day has content
        const hasContent = Object.values(updateData.schedule).some(day => day && day.trim());
        if (!hasContent) {
          errors.push('At least one day must have training schedule');
        }
      }

      // Check protected fields
      const protectedFields = ['code', 'bmiCategory', 'bodyFatCategory'];
      const protectedAttempts = protectedFields.filter(field => updateData[field] !== undefined);
      
      if (protectedAttempts.length > 0) {
        errors.push(`Cannot modify protected fields: ${protectedAttempts.join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Get program completion status
    getCompletionStatus: (program) => {
      const requiredFields = ['name', 'description', 'cardioRatio', 'dietRecommendation', 'schedule'];
      const completedFields = requiredFields.filter(field => {
        if (field === 'schedule') {
          return program.schedule && Object.keys(program.schedule).length === 7 &&
                 Object.values(program.schedule).some(day => day && day.trim());
        }
        return program[field] && program[field].trim();
      });
      
      return {
        completed: completedFields.length,
        total: requiredFields.length,
        percentage: Math.round((completedFields.length / requiredFields.length) * 100),
        missingFields: requiredFields.filter(field => !completedFields.includes(field))
      };
    }
  },

  // Utility methods
  utils: {
    // Get BMI category display name
    getBMIDisplay: (category) => {
      const mapping = {
        'B1': 'Underweight',
        'B2': 'Ideal',
        'B3': 'Overweight',
        'B4': 'Obese'
      };
      return mapping[category] || category;
    },

    // Get body fat category display name
    getBodyFatDisplay: (category) => {
      const mapping = {
        'L1': 'Rendah',
        'L2': 'Normal',
        'L3': 'Tinggi'
      };
      return mapping[category] || category;
    },

    // Get condition display (BMI + Body Fat)
    getConditionDisplay: (program) => {
      const bmi = this.getBMIDisplay(program.bmiCategory);
      const bodyFat = this.getBodyFatDisplay(program.bodyFatCategory);
      return `${bmi} + ${bodyFat}`;
    },

    // Count training days in schedule
    getTrainingDays: (schedule) => {
      if (!schedule) return 0;
      return Object.values(schedule).filter(day => 
        day && day.trim() && 
        !day.toLowerCase().includes('rest') && 
        !day.toLowerCase().includes('cardio')
      ).length;
    },

    // Sort programs by code
    sortByCode: (programs) => {
      return programs.sort((a, b) => {
        const numA = parseInt(a.code.replace('P', ''));
        const numB = parseInt(b.code.replace('P', ''));
        return numA - numB;
      });
    },

    // Get program card color based on code
    getProgramCardColor: (code) => {
      const colors = {
        'P1': 'border-red-200 bg-red-50',
        'P2': 'border-green-200 bg-green-50',
        'P3': 'border-blue-200 bg-blue-50',
        'P4': 'border-orange-200 bg-orange-50',
        'P5': 'border-purple-200 bg-purple-50',
        'P6': 'border-indigo-200 bg-indigo-50',
        'P7': 'border-pink-200 bg-pink-50',
        'P8': 'border-yellow-200 bg-yellow-50',
        'P9': 'border-cyan-200 bg-cyan-50',
        'P10': 'border-gray-200 bg-gray-50'
      };
      return colors[code] || 'border-gray-200 bg-gray-50';
    }
  }
};

