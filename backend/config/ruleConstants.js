// backend/config/ruleConstants.js  
export const RULE_CONSTANTS = {
  BMI_CATEGORIES: {
    B1: { 
      code: 'B1', 
      name: 'Underweight', 
      range: '<18.5',
      description: 'Below normal weight'
    },
    B2: { 
      code: 'B2', 
      name: 'Ideal', 
      range: '18.5-24.9',
      description: 'Normal healthy weight'
    },
    B3: { 
      code: 'B3', 
      name: 'Overweight', 
      range: '25-29.9',
      description: 'Above normal weight'
    },
    B4: { 
      code: 'B4', 
      name: 'Obese', 
      range: '≥30',
      description: 'Significantly above normal weight'
    }
  },

  BODY_FAT_CATEGORIES: {
    MALE: {
      L1: { code: 'L1', name: 'Rendah', range: '<10%' },
      L2: { code: 'L2', name: 'Normal', range: '10-20%' },
      L3: { code: 'L3', name: 'Tinggi', range: '>20%' }
    },
    FEMALE: {
      L1: { code: 'L1', name: 'Rendah', range: '<20%' },
      L2: { code: 'L2', name: 'Normal', range: '20-30%' },
      L3: { code: 'L3', name: 'Tinggi', range: '>30%' }
    }
  },

  // Program mapping for each realistic combination
  PROGRAM_MAPPING: {
    'B1-L1': 'P1',  // Underweight + Low → Fat Loss Program
    'B1-L2': 'P5',  // Underweight + Normal → Lean Muscle Program  
    'B1-L3': 'P9',  // Underweight + High → Beginner Muscle Building Program
    'B2-L1': 'P6',  // Ideal + Low → Strength & Definition Program
    'B2-L2': 'P2',  // Ideal + Normal → Muscle Gain Program
    'B2-L3': 'P7',  // Ideal + High → Fat Burning & Toning Program
    'B3-L1': 'P10', // Overweight + Low → Advanced Strength Program
    'B3-L2': 'P8',  // Overweight + Normal → Body Recomposition Program
    'B3-L3': 'P3',  // Overweight + High → Weight Loss Program
    'B4-L3': 'P4',  // Obese + High → Extreme Weight Loss Program
  },

  // Validation rules
  VALIDATION: {
    REQUIRED_FIELDS: ['bmiCategory', 'bodyFatCategory', 'programId'],
    ALLOWED_BMI: ['B1', 'B2', 'B3', 'B4'],
    ALLOWED_BODY_FAT: ['L1', 'L2', 'L3'],
    REALISTIC_COMBINATIONS: [
      'B1-L1', 'B1-L2', 'B1-L3',
      'B2-L1', 'B2-L2', 'B2-L3', 
      'B3-L1', 'B3-L2', 'B3-L3',
      'B4-L3'
    ],
    IMPOSSIBLE_COMBINATIONS: ['B4-L1', 'B4-L2']
  },

  // Helper functions
  getDisplayName(category, type = 'bmi') {
    if (type === 'bmi') {
      return this.BMI_CATEGORIES[category]?.name || category;
    } else {
      return this.BODY_FAT_CATEGORIES.MALE[category]?.name || 
             this.BODY_FAT_CATEGORIES.FEMALE[category]?.name || 
             category;
    }
  },

  getProgramForCombination(bmiCategory, bodyFatCategory) {
    const key = `${bmiCategory}-${bodyFatCategory}`;
    return this.PROGRAM_MAPPING[key] || 'P2'; // Default fallback
  },

  isRealisticCombination(bmiCategory, bodyFatCategory) {
    const key = `${bmiCategory}-${bodyFatCategory}`;
    return this.VALIDATION.REALISTIC_COMBINATIONS.includes(key);
  },

  getRealisticCombinations() {
    return this.VALIDATION.REALISTIC_COMBINATIONS.map(combo => {
      const [bmi, bodyFat] = combo.split('-');
      return {
        bmiCategory: bmi,
        bodyFatCategory: bodyFat,
        combination: combo,
        programCode: this.PROGRAM_MAPPING[combo],
        description: `${this.getDisplayName(bmi, 'bmi')} + ${this.getDisplayName(bodyFat, 'bodyFat')}`
      };
    });
  }
};