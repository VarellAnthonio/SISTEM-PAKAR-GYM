// backend/utils/medicalLogic.js
export const MedicalLogic = {
  // Define 10 realistic BMI + Body Fat combinations
  REALISTIC_COMBINATIONS: [
    { bmi: 'B1', bodyFat: 'L1', program: 'P1' },  // Underweight + Low → Fat Loss
    { bmi: 'B1', bodyFat: 'L2', program: 'P5' },  // Underweight + Normal → Lean Muscle  
    { bmi: 'B1', bodyFat: 'L3', program: 'P9' },  // Underweight + High → Beginner Muscle
    { bmi: 'B2', bodyFat: 'L1', program: 'P6' },  // Ideal + Low → Strength & Definition
    { bmi: 'B2', bodyFat: 'L2', program: 'P2' },  // Ideal + Normal → Muscle Gain
    { bmi: 'B2', bodyFat: 'L3', program: 'P7' },  // Ideal + High → Fat Burning & Toning
    { bmi: 'B3', bodyFat: 'L1', program: 'P10' }, // Overweight + Low → Advanced Strength
    { bmi: 'B3', bodyFat: 'L2', program: 'P8' },  // Overweight + Normal → Body Recomposition
    { bmi: 'B3', bodyFat: 'L3', program: 'P3' },  // Overweight + High → Weight Loss
    { bmi: 'B4', bodyFat: 'L3', program: 'P4' },  // Obese + High → Extreme Weight Loss
  ],

  // Medically impossible combinations
  IMPOSSIBLE_COMBINATIONS: [
    'B4-L1', // Obese + Low body fat (contradictory)
    'B4-L2'  // Obese + Normal body fat (very rare/contradictory)
  ],

  // Validate if combination is medically realistic
  isRealisticCombination(bmiCategory, bodyFatCategory) {
    const combo = `${bmiCategory}-${bodyFatCategory}`;
    return !this.IMPOSSIBLE_COMBINATIONS.includes(combo);
  },

  // Handle edge cases for impossible combinations
  handleEdgeCase(bmiCategory, bodyFatCategory) {
    const combo = `${bmiCategory}-${bodyFatCategory}`;
    
    if (this.IMPOSSIBLE_COMBINATIONS.includes(combo)) {
      // Redirect B4+L1/L2 to B4+L3 (most logical for obese person)
      return {
        bmiCategory: 'B4',
        bodyFatCategory: 'L3',
        isEdgeCase: true,
        originalCombo: combo,
        reason: 'Redirected to realistic combination'
      };
    }
    
    return {
      bmiCategory,
      bodyFatCategory, 
      isEdgeCase: false
    };
  },

  // Get all realistic combinations for seeding
  getRealisticCombinations() {
    return this.REALISTIC_COMBINATIONS;
  },

  // Find combination data by BMI + BodyFat
  findCombination(bmiCategory, bodyFatCategory) {
    return this.REALISTIC_COMBINATIONS.find(
      combo => combo.bmi === bmiCategory && combo.bodyFat === bodyFatCategory
    );
  },

  // Get program code for combination
  getProgramForCombination(bmiCategory, bodyFatCategory) {
    // Handle edge cases first
    const handled = this.handleEdgeCase(bmiCategory, bodyFatCategory);
    
    const combination = this.findCombination(handled.bmiCategory, handled.bodyFatCategory);
    
    return {
      programCode: combination?.program || 'P2', // Fallback to P2
      isEdgeCase: handled.isEdgeCase,
      originalCombo: handled.originalCombo,
      finalCombo: `${handled.bmiCategory}-${handled.bodyFatCategory}`
    };
  },

  // Validate rule data
  validateRuleData(ruleData) {
    const errors = [];
    
    if (!this.isRealisticCombination(ruleData.bmiCategory, ruleData.bodyFatCategory)) {
      errors.push(`Combination ${ruleData.bmiCategory}+${ruleData.bodyFatCategory} is not supported`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Enhanced forward chaining with edge case handling
  forwardChaining(bmi, bodyFat, gender) {
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

    // Get program recommendation with edge case handling
    const result = this.getProgramForCombination(bmiCategory, bodyFatCategory);

    return {
      input: { bmi, bodyFat, gender },
      categories: {
        original: { bmi: bmiCategory, bodyFat: bodyFatCategory },
        final: { 
          bmi: result.finalCombo.split('-')[0], 
          bodyFat: result.finalCombo.split('-')[1] 
        }
      },
      program: result.programCode,
      isEdgeCase: result.isEdgeCase,
      edgeInfo: result.isEdgeCase ? {
        original: result.originalCombo,
        redirected: result.finalCombo,
        reason: 'Impossible combination redirected to realistic alternative'
      } : null
    };
  }
};