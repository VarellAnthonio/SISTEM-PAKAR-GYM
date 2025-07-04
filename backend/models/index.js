// Import all models
import User from './User.js';
import Program from './Program.js';
import Exercise from './Exercise.js';
import Rule from './Rule.js';
import Consultation from './Consultation.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// Define all associations here to avoid circular dependency issues
const defineAssociations = () => {
  // Rule <-> Program associations
  Rule.belongsTo(Program, {
    foreignKey: 'programId',
    as: 'program'
  });

  Program.hasMany(Rule, {
    foreignKey: 'programId',
    as: 'rules'
  });

  // Consultation <-> User associations
  Consultation.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasMany(Consultation, {
    foreignKey: 'userId',
    as: 'consultations'
  });

  // Consultation <-> Program associations
  Consultation.belongsTo(Program, {
    foreignKey: 'programId',
    as: 'program'
  });

  Program.hasMany(Consultation, {
    foreignKey: 'programId',
    as: 'consultations'
  });

  // Consultation <-> Rule associations
  Consultation.belongsTo(Rule, {
    foreignKey: 'ruleId',
    as: 'rule'
  });

  Rule.hasMany(Consultation, {
    foreignKey: 'ruleId',
    as: 'consultations'
  });
};

// Static methods for Rule (moved here to avoid circular dependency)
Rule.findByCondition = async function(bmiCategory, bodyFatCategory) {
  return await this.findOne({
    where: {
      bmiCategory,
      bodyFatCategory,
      isActive: true
    },
    include: [{
      model: Program,
      as: 'program',
      where: {
        isActive: true
      }
    }]
    // REMOVED: order: [['priority', 'ASC']] - priority column doesn't exist
  });
};

Rule.getAllActiveRules = async function() {
  return await this.findAll({
    where: {
      isActive: true
    },
    include: [{
      model: Program,
      as: 'program',
      where: {
        isActive: true
      }
    }],
    order: [['bmiCategory', 'ASC'], ['bodyFatCategory', 'ASC']]
    // REMOVED: ['priority', 'ASC'] - priority column doesn't exist
  });
};

// Forward Chaining Implementation - FIXED
Rule.forwardChaining = async function(bmi, bodyFat, gender) {
  try {
    console.log('Forward chaining input:', { bmi, bodyFat, gender });
    
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

    console.log('Determined categories:', { bmiCategory, bodyFatCategory });

    // Find matching rule - FIXED query without priority
    const rule = await this.findByCondition(bmiCategory, bodyFatCategory);
    
    if (!rule) {
      console.log('No rule found, using fallback to P2');
      // Fallback to default program (P2)
      const defaultProgram = await Program.findOne({
        where: { code: 'P2', isActive: true }
      });
      
      return {
        bmiCategory,
        bodyFatCategory,
        program: defaultProgram,
        rule: null,
        isDefault: true
      };
    }

    console.log('Rule found:', { ruleId: rule.id, programCode: rule.program.code });

    return {
      bmiCategory,
      bodyFatCategory,
      program: rule.program,
      rule: rule,
      isDefault: false
    };
  } catch (error) {
    console.error('Forward chaining error details:', error);
    throw new Error(`Forward chaining error: ${error.message}`);
  }
};

// Static methods for Consultation
Consultation.findByUser = async function(userId, options = {}) {
  const { limit = 10, offset = 0, status = null } = options;
  
  const where = { userId };
  if (status) where.status = status;
  
  return await this.findAndCountAll({
    where,
    include: [
      {
        model: Program,
        as: 'program',
        attributes: ['id', 'code', 'name', 'cardioRatio']
      },
      {
        model: Rule,
        as: 'rule',
        attributes: ['id', 'name']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

Consultation.getStatistics = async function() {
  const total = await this.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await this.count({
    where: {
      createdAt: {
        [sequelize.Op.gte]: today
      }
    }
  });

  // Get program statistics with proper sequelize import
  const { Sequelize } = await import('sequelize');
  
  const programStats = await this.findAll({
    attributes: [
      'programId',
      [Sequelize.fn('COUNT', Sequelize.col('Consultation.id')), 'count']
    ],
    include: [{
      model: Program,
      as: 'program',
      attributes: ['code', 'name']
    }],
    group: ['Consultation.programId', 'program.id'],
    order: [[Sequelize.literal('count'), 'DESC']]
  });

  const activeUsers = await this.count({
    distinct: true,
    col: 'userId',
    where: {
      createdAt: {
        [sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });

  return {
    total,
    today: todayCount,
    activeUsers,
    programStats: programStats.map(stat => ({
      program: stat.program,
      count: parseInt(stat.get('count'))
    }))
  };
};

// Create consultation with forward chaining - ENHANCED ERROR HANDLING
Consultation.createWithForwardChaining = async function(consultationData) {
  const { userId, weight, height, bodyFatPercentage, notes } = consultationData;
  
  try {
    console.log('Creating consultation with forward chaining:', consultationData);
    
    // Get user for gender information
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log('User found:', { id: user.id, gender: user.gender });

    // Calculate BMI
    const bmi = weight / Math.pow(height / 100, 2);
    console.log('Calculated BMI:', bmi);

    // Run forward chaining
    const chainResult = await Rule.forwardChaining(bmi, bodyFatPercentage, user.gender);
    console.log('Forward chaining result:', chainResult);

    if (!chainResult.program) {
      throw new Error('No program found by forward chaining');
    }

    // Create consultation record
    const consultation = await this.create({
      userId,
      programId: chainResult.program.id,
      ruleId: chainResult.rule ? chainResult.rule.id : null,
      weight,
      height,
      bodyFatPercentage,
      bmi: parseFloat(bmi.toFixed(2)),
      bmiCategory: chainResult.bmiCategory,
      bodyFatCategory: chainResult.bodyFatCategory,
      isDefault: chainResult.isDefault,
      notes,
      status: 'active'
    });

    console.log('Consultation created:', { id: consultation.id });

    // Return consultation with associations
    const resultConsultation = await this.findByPk(consultation.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'gender']
        },
        {
          model: Program,
          as: 'program'
        },
        {
          model: Rule,
          as: 'rule'
        }
      ]
    });

    console.log('Consultation created successfully with associations');
    return resultConsultation;

  } catch (error) {
    console.error('Create consultation with forward chaining error:', error);
    throw error;
  }
};

// Initialize associations
defineAssociations();

// Export all models
export {
  User,
  Program,
  Exercise,
  Rule,
  Consultation
};

// Export default object for convenience
export default {
  User,
  Program,
  Exercise,
  Rule,
  Consultation,
  defineAssociations
};