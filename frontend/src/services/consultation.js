import { apiService } from './api';

export const consultationService = {
  // Create new consultation with forward chaining
  create: async (consultationData) => {
    try {
      console.log('Sending consultation data to API:', consultationData);
      const response = await apiService.consultations.create(consultationData);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Forward chaining failed');
      }
    } catch (error) {
      console.error('Consultation API Error:', error);
      
      const message = error.response?.data?.message || error.message || 'Failed to create consultation';
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
  },

  // Utility methods for consultation data
  utils: {
    // Calculate BMI
    calculateBMI: (weight, height) => {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    },

    // Get BMI category
    getBMICategory: (bmi) => {
      if (bmi < 18.5) return 'B1'; // Underweight
      if (bmi >= 18.5 && bmi <= 24.9) return 'B2'; // Ideal
      if (bmi >= 25 && bmi <= 29.9) return 'B3'; // Overweight
      return 'B4'; // Obese
    },

    // Get body fat category based on gender
    getBodyFatCategory: (bodyFat, gender) => {
      if (gender === 'male') {
        if (bodyFat < 10) return 'L1'; // Rendah
        if (bodyFat >= 10 && bodyFat <= 20) return 'L2'; // Normal
        return 'L3'; // Tinggi
      } else {
        if (bodyFat < 20) return 'L1'; // Rendah
        if (bodyFat >= 20 && bodyFat <= 30) return 'L2'; // Normal
        return 'L3'; // Tinggi
      }
    },

    // Get display names for categories
    getBMIDisplay: (category) => {
      const mapping = {
        'B1': 'Underweight',
        'B2': 'Ideal',
        'B3': 'Overweight',
        'B4': 'Obese'
      };
      return mapping[category] || category;
    },

    getBodyFatDisplay: (category) => {
      const mapping = {
        'L1': 'Rendah',
        'L2': 'Normal',
        'L3': 'Tinggi'
      };
      return mapping[category] || category;
    },

    // Validate consultation input
    validateConsultationData: (data) => {
      const errors = [];

      if (!data.weight || data.weight <= 0 || data.weight > 300) {
        errors.push('Weight must be between 1 and 300 kg');
      }

      if (!data.height || data.height <= 0 || data.height > 250) {
        errors.push('Height must be between 1 and 250 cm');
      }

      if (!data.bodyFatPercentage || data.bodyFatPercentage <= 0 || data.bodyFatPercentage > 70) {
        errors.push('Body fat percentage must be between 1 and 70%');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Format consultation data for display
    formatConsultationResult: (consultation) => {
      if (!consultation) return null;

      return {
        id: consultation.id,
        user: consultation.user?.name || 'Unknown',
        weight: consultation.weight,
        height: consultation.height,
        bodyFatPercentage: consultation.bodyFatPercentage,
        bmi: consultation.bmi,
        bmiCategory: consultation.bmiCategory,
        bodyFatCategory: consultation.bodyFatCategory,
        programCode: consultation.program?.code,
        programName: consultation.program?.name,
        bmiDisplay: this.getBMIDisplay(consultation.bmiCategory),
        bodyFatDisplay: this.getBodyFatDisplay(consultation.bodyFatCategory),
        timestamp: consultation.createdAt,
        notes: consultation.notes,
        status: consultation.status
      };
    },

    // Get program mapping (for reference - actual logic is in backend)
    getProgramMapping: () => {
      return {
        'B1-L1': 'P1', // Underweight + Low → Fat Loss Program
        'B1-L2': 'P5', // Underweight + Normal → Lean Muscle Program
        'B1-L3': 'P9', // Underweight + High → Beginner Muscle Building Program
        'B2-L1': 'P6', // Ideal + Low → Strength & Definition Program
        'B2-L2': 'P2', // Ideal + Normal → Muscle Gain Program
        'B2-L3': 'P7', // Ideal + High → Fat Burning & Toning Program
        'B3-L1': 'P10', // Overweight + Low → Advanced Strength Program
        'B3-L2': 'P8', // Overweight + Normal → Body Recomposition Program
        'B3-L3': 'P3', // Overweight + High → Weight Loss Program
        'B4-L3': 'P4', // Obese + High → Extreme Weight Loss Program
      };
    },

    // Check if combination is realistic (for reference)
    isRealisticCombination: (bmiCategory, bodyFatCategory) => {
      const realisticCombinations = [
        'B1-L1', 'B1-L2', 'B1-L3',
        'B2-L1', 'B2-L2', 'B2-L3',
        'B3-L1', 'B3-L2', 'B3-L3',
        'B4-L3'
      ];
      const combo = `${bmiCategory}-${bodyFatCategory}`;
      return realisticCombinations.includes(combo);
    }
  }
};