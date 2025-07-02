import { Rule, Program } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { MedicalLogic } from '../utils/medicalLogic.js';
import { RULE_CONSTANTS } from '../config/ruleConstants.js';

// @desc    Get all rules
// @route   GET /api/rules
// @access  Private
export const getRules = async (req, res) => {
  try {
    const { search, active, bmiCategory, bodyFatCategory } = req.query;

    let whereClause = {};
    
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    if (bmiCategory) {
      whereClause.bmiCategory = bmiCategory;
    }

    if (bodyFatCategory) {
      whereClause.bodyFatCategory = bodyFatCategory;
    }

    const rules = await Rule.findAll({
      where: whereClause,
      include: [
        {
          model: Program,
          as: 'program',
          attributes: ['id', 'code', 'name', 'isActive']
        }
      ],
      order: [['bmiCategory', 'ASC'], ['bodyFatCategory', 'ASC']]
    });

    res.json({
      success: true,
      data: rules
    });

  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rules'
    });
  }
};

// @desc    Get rule by ID
// @route   GET /api/rules/:id
// @access  Private
export const getRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await Rule.findByPk(id, {
      include: [
        {
          model: Program,
          as: 'program',
          attributes: ['id', 'code', 'name', 'isActive']
        }
      ]
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });

  } catch (error) {
    console.error('Get rule by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rule'
    });
  }
};

// @desc    Update rule - PROGRAM ASSIGNMENT ONLY
// @route   PUT /api/rules/:id
// @access  Private (Admin)
export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { programId } = req.body;

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'Program ID is required'
      });
    }

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    // Verify program exists
    const program = await Program.findByPk(programId);
    if (!program) {
      return res.status(400).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Only allow program assignment updates
    await rule.update({ 
      programId: parseInt(programId)
    });

    // Fetch updated rule with program details
    const updatedRule = await Rule.findByPk(id, {
      include: [
        {
          model: Program,
          as: 'program',
          attributes: ['id', 'code', 'name', 'isActive']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Program assignment updated successfully',
      data: updatedRule
    });

  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rule'
    });
  }
};

// @desc    Get rule statistics
// @route   GET /api/rules/stats
// @access  Private (Admin)
export const getRuleStats = async (req, res) => {
  try {
    const totalRules = await Rule.count();
    const activeRules = await Rule.count({ where: { isActive: true } });

    // Count by BMI categories
    const bmiStats = await Rule.findAll({
      attributes: [
        'bmiCategory',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['bmiCategory']
    });

    // Count by Body Fat categories
    const bodyFatStats = await Rule.findAll({
      attributes: [
        'bodyFatCategory',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['bodyFatCategory']
    });

    // Calculate coverage (max 10 realistic combinations)
    const maxRealisticCombinations = 10;
    const coverage = Math.round((activeRules / maxRealisticCombinations) * 100);

    res.json({
      success: true,
      data: {
        total: totalRules,
        active: activeRules,
        inactive: totalRules - activeRules,
        coverage: `${coverage}%`,
        maxCombinations: maxRealisticCombinations,
        bmiDistribution: bmiStats.map(stat => ({
          category: stat.bmiCategory,
          count: parseInt(stat.get('count'))
        })),
        bodyFatDistribution: bodyFatStats.map(stat => ({
          category: stat.bodyFatCategory,
          count: parseInt(stat.get('count'))
        }))
      }
    });

  } catch (error) {
    console.error('Get rule stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rule statistics'
    });
  }
};

// @desc    Get missing combinations
// @route   GET /api/rules/missing-combinations
// @access  Private (Admin)
export const getMissingCombinations = async (req, res) => {
  try {
    // Get all existing active combinations
    const existingRules = await Rule.findAll({
      where: { isActive: true },
      attributes: ['bmiCategory', 'bodyFatCategory']
    });

    const existingCombinations = existingRules.map(rule => 
      `${rule.bmiCategory}-${rule.bodyFatCategory}`
    );

    // Get realistic combinations from medical logic
    const realisticCombinations = MedicalLogic.getRealisticCombinations();
    const realisticComboKeys = realisticCombinations.map(combo => 
      `${combo.bmi}-${combo.bodyFat}`
    );

    // Find missing realistic combinations
    const missingCombinations = realisticComboKeys.filter(combo => 
      !existingCombinations.includes(combo)
    );

    const missingDetails = missingCombinations.map(combo => {
      const [bmi, bodyFat] = combo.split('-');
      return {
        combination: combo,
        bmiCategory: bmi,
        bodyFatCategory: bodyFat,
        bmiDisplay: RULE_CONSTANTS.getDisplayName(bmi, 'bmi'),
        bodyFatDisplay: RULE_CONSTANTS.getDisplayName(bodyFat, 'bodyFat')
      };
    });

    res.json({
      success: true,
      data: {
        totalRealistic: realisticCombinations.length,
        existing: existingCombinations.length,
        missing: missingCombinations.length,
        missingCombinations: missingDetails,
        impossibleCombinations: ['B4-L1', 'B4-L2'] // Excluded by design
      }
    });

  } catch (error) {
    console.error('Get missing combinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get missing combinations'
    });
  }
};

// Helper functions
const getBMICategoryDisplay = (category) => {
  return RULE_CONSTANTS.getDisplayName(category, 'bmi');
};

const getBodyFatCategoryDisplay = (category) => {
  return RULE_CONSTANTS.getDisplayName(category, 'bodyFat');
};