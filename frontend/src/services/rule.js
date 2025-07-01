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

  // Search rules by condition
  searchByCondition: async (bmiCategory, bodyFatCategory) => {
    try {
      const response = await apiService.rules.getAll({
        bmiCategory,
        bodyFatCategory
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search rules';
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

  // Admin methods
  admin: {
    // Create new rule
    create: async (ruleData) => {
      try {
        const response = await apiService.rules.create(ruleData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create rule';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Update rule
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

    // Delete rule
    delete: async (id) => {
      try {
        const response = await apiService.rules.delete(id);
        return {
          success: true,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete rule';
        return {
          success: false,
          message
        };
      }
    },

    // Toggle rule status
    toggleStatus: async (id) => {
      try {
        const response = await apiService.rules.toggleStatus(id);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to toggle rule status';
        return {
          success: false,
          message
        };
      }
    },

    // Test forward chaining
    testForwardChaining: async (testData) => {
      try {
        const response = await apiService.rules.testForwardChaining(testData);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Forward chaining test failed';
        return {
          success: false,
          message
        };
      }
    },

    // Bulk create rules
    bulkCreate: async (rulesData) => {
      try {
        const response = await apiService.rules.bulkCreate({ rules: rulesData });
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create rules';
        return {
          success: false,
          message
        };
      }
    },

    // Validate rule configuration
    validate: async (ruleData) => {
      try {
        // For now, just do client-side validation
        // In real implementation, this could call a validation endpoint
        const errors = [];
        
        if (!ruleData.name) errors.push('Rule name is required');
        if (!ruleData.bmiCategory) errors.push('BMI category is required');
        if (!ruleData.bodyFatCategory) errors.push('Body fat category is required');
        if (!ruleData.programId) errors.push('Program is required');

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

  // Forward chaining utilities
  forwardChaining: {
    // Test specific conditions
    test: async (conditions) => {
      try {
        const response = await apiService.rules.testForwardChaining(conditions);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Forward chaining test failed';
        return {
          success: false,
          message
        };
      }
    },

    // Get rule chain for conditions (client-side calculation)
    getChain: async (bmi, bodyFat, gender) => {
      try {
        // Determine BMI category
        let bmiCategory;
        if (bmi < 18.5) bmiCategory = 'B1'; // Underweight
        else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'B2'; // Ideal
        else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'B3'; // Overweight
        else bmiCategory = 'B4'; // Obese

        // Determine Body Fat category based on gender
        let bodyFatCategory;
        if (gender === 'male') {
          if (bodyFat < 10) bodyFatCategory = 'L1'; // Rendah
          else if (bodyFat >= 10 && bodyFat <= 20) bodyFatCategory = 'L2'; // Normal
          else bodyFatCategory = 'L3'; // Tinggi
        } else {
          if (bodyFat < 20) bodyFatCategory = 'L1'; // Rendah
          else if (bodyFat >= 20 && bodyFat <= 30) bodyFatCategory = 'L2'; // Normal
          else bodyFatCategory = 'L3'; // Tinggi
        }

        // Get matching rule
        const rulesResult = await this.parent.searchByCondition(bmiCategory, bodyFatCategory);
        
        if (rulesResult.success && rulesResult.data.length > 0) {
          const rule = rulesResult.data[0];
          return {
            success: true,
            data: {
              bmiCategory,
              bodyFatCategory,
              rule,
              isDefault: false
            }
          };
        }

        // Fallback to default program (P2)
        return {
          success: true,
          data: {
            bmiCategory,
            bodyFatCategory,
            rule: null,
            isDefault: true,
            defaultProgram: 'P2'
          }
        };

      } catch (error) {
        return {
          success: false,
          message: 'Failed to get rule chain'
        };
      }
    },

    // Validate forward chaining logic (client-side)
    validate: async () => {
      try {
        const rulesResult = await this.parent.getAll({ active: true });
        
        if (!rulesResult.success) {
          return {
            success: false,
            message: 'Failed to validate: Cannot fetch rules'
          };
        }

        const rules = rulesResult.data;
        const combinations = [];
        const duplicates = [];

        // Check for duplicate combinations
        rules.forEach(rule => {
          const combo = `${rule.bmiCategory}-${rule.bodyFatCategory}`;
          if (combinations.includes(combo)) {
            duplicates.push(combo);
          } else {
            combinations.push(combo);
          }
        });

        // Calculate coverage
        const maxCombinations = 12; // 4 BMI × 3 BodyFat
        const coverage = Math.round((combinations.length / maxCombinations) * 100);

        return {
          success: true,
          data: {
            totalRules: rules.length,
            uniqueCombinations: combinations.length,
            duplicates,
            coverage: `${coverage}%`,
            isValid: duplicates.length === 0
          }
        };

      } catch (error) {
        return {
          success: false,
          message: 'Forward chaining validation failed'
        };
      }
    }
  }
};

// Add parent reference for internal method calls
ruleService.forwardChaining.parent = ruleService;