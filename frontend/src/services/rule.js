import { apiService } from './api';

export const ruleService = {
  // Get all rules
  getAll: async (params = {}) => {
    try {
      const response = await apiService.rules.getAll(params);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get rules';
      return {
        success: false,
        message
      };
    }
  },

  // Get rule by ID
  getById: async (id) => {
    try {
      const response = await apiService.rules.getById(id);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get rule';
      return {
        success: false,
        message
      };
    }
  },

  // Get rule statistics
  getStats: async () => {
    try {
      const response = await apiService.rules.getStats();
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get rule statistics';
      return {
        success: false,
        message
      };
    }
  },

  // Get missing combinations
  getMissingCombinations: async () => {
    try {
      const response = await apiService.rules.getMissingCombinations();
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get missing combinations';
      return {
        success: false,
        message
      };
    }
  },

  // Admin methods - SIMPLIFIED (assignment only)
  admin: {
    // Update rule - PROGRAM ASSIGNMENT ONLY
    update: async (id, updateData) => {
      try {
        const response = await apiService.rules.update(id, updateData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update rule';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Get rule statistics (admin view)
    getStats: async () => {
      try {
        const response = await apiService.rules.getStats();
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to get rule statistics';
        return {
          success: false,
          message
        };
      }
    },

    // Get missing combinations (admin view)
    getMissingCombinations: async () => {
      try {
        const response = await apiService.rules.getMissingCombinations();
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to get missing combinations';
        return {
          success: false,
          message
        };
      }
    },

    // Validate rule assignment (client-side)
    validateAssignment: async (ruleData) => {
      try {
        const errors = [];
        
        if (!ruleData.programId) {
          errors.push('Program assignment is required');
        }

        if (errors.length > 0) {
          return {
            success: false,
            message: 'Validation failed',
            errors
          };
        }

        return {
          success: true,
          data: { valid: true }
        };
      } catch (error) {
        return {
          success: false,
          message: 'Rule validation failed'
        };
      }
    }
  },

  // Utility methods for UI
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
    getConditionDisplay: (rule) => {
      const bmi = this.getBMIDisplay(rule.bmiCategory);
      const bodyFat = this.getBodyFatDisplay(rule.bodyFatCategory);
      return `${bmi} + ${bodyFat}`;
    },

    // Get program display
    getProgramDisplay: (rule, programs) => {
      if (rule.program) {
        return `${rule.program.code} - ${rule.program.name}`;
      }
      
      const program = programs.find(p => p.id === rule.programId);
      return program ? `${program.code} - ${program.name}` : 'Program tidak ditemukan';
    },

    // Check if combination is realistic
    isRealisticCombination: (bmiCategory, bodyFatCategory) => {
      const realisticCombinations = [
        'B1-L1', 'B1-L2', 'B1-L3',
        'B2-L1', 'B2-L2', 'B2-L3', 
        'B3-L1', 'B3-L2', 'B3-L3',
        'B4-L3'
      ];
      const combo = `${bmiCategory}-${bodyFatCategory}`;
      return realisticCombinations.includes(combo);
    },

    // Get realistic combinations list
    getRealisticCombinations: () => {
      return [
        { bmi: 'B1', bodyFat: 'L1', desc: 'Underweight + Low Body Fat' },
        { bmi: 'B1', bodyFat: 'L2', desc: 'Underweight + Normal Body Fat' },
        { bmi: 'B1', bodyFat: 'L3', desc: 'Underweight + High Body Fat' },
        { bmi: 'B2', bodyFat: 'L1', desc: 'Ideal + Low Body Fat' },
        { bmi: 'B2', bodyFat: 'L2', desc: 'Ideal + Normal Body Fat' },
        { bmi: 'B2', bodyFat: 'L3', desc: 'Ideal + High Body Fat' },
        { bmi: 'B3', bodyFat: 'L1', desc: 'Overweight + Low Body Fat' },
        { bmi: 'B3', bodyFat: 'L2', desc: 'Overweight + Normal Body Fat' },
        { bmi: 'B3', bodyFat: 'L3', desc: 'Overweight + High Body Fat' },
        { bmi: 'B4', bodyFat: 'L3', desc: 'Obese + High Body Fat' }
      ];
    }
  }
};

// REMOVED METHODS (no longer supported):
// ❌ admin.create() - Rules cannot be created
// ❌ admin.delete() - Rules cannot be deleted  
// ❌ admin.toggleStatus() - Rules cannot be toggled
// ❌ admin.testForwardChaining() - Testing moved to backend
// ❌ admin.bulkCreate() - Bulk operations removed
// ❌ forwardChaining.test() - Client-side FC removed