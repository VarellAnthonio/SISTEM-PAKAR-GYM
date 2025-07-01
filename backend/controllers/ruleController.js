import { Rule, Program } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

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
      order: [['priority', 'ASC'], ['bmiCategory', 'ASC'], ['bodyFatCategory', 'ASC']]
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

// @desc    Create new rule (Admin only)
// @route   POST /api/rules
// @access  Private (Admin)
export const createRule = async (req, res) => {
  try {
    const {
      name,
      description,
      bmiCategory,
      bodyFatCategory,
      programId,
      priority,
      conditions,
      isActive
    } = req.body;

    // Check if combination already exists
    const existingRule = await Rule.findOne({
      where: { 
        bmiCategory, 
        bodyFatCategory,
        isActive: true 
      }
    });

    if (existingRule) {
      return res.status(400).json({
        success: false,
        message: 'Rule with this BMI and Body Fat combination already exists'
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

    const rule = await Rule.create({
      name,
      description,
      bmiCategory,
      bodyFatCategory,
      programId,
      priority: priority || 1,
      conditions: conditions || {},
      isActive: isActive !== undefined ? isActive : true
    });

    // Fetch created rule with program details
    const createdRule = await Rule.findByPk(rule.id, {
      include: [
        {
          model: Program,
          as: 'program',
          attributes: ['id', 'code', 'name', 'isActive']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      data: createdRule
    });

  } catch (error) {
    console.error('Create rule error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create rule'
    });
  }
};

// @desc    Update rule (Admin only)
// @route   PUT /api/rules/:id
// @access  Private (Admin)
export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    // If updating BMI/Body Fat categories, check combination uniqueness
    if (updateData.bmiCategory || updateData.bodyFatCategory) {
      const bmiCategory = updateData.bmiCategory || rule.bmiCategory;
      const bodyFatCategory = updateData.bodyFatCategory || rule.bodyFatCategory;
      
      const existingRule = await Rule.findOne({
        where: { 
          bmiCategory, 
          bodyFatCategory,
          isActive: true,
          id: { [Op.ne]: id }
        }
      });

      if (existingRule) {
        return res.status(400).json({
          success: false,
          message: 'Rule with this BMI and Body Fat combination already exists'
        });
      }
    }

    // Verify program exists if updating programId
    if (updateData.programId) {
      const program = await Program.findByPk(updateData.programId);
      if (!program) {
        return res.status(400).json({
          success: false,
          message: 'Program not found'
        });
      }
    }

    await rule.update(updateData);

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
      message: 'Rule updated successfully',
      data: updatedRule
    });

  } catch (error) {
    console.error('Update rule error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update rule'
    });
  }
};

// @desc    Delete rule (Admin only)
// @route   DELETE /api/rules/:id
// @access  Private (Admin)
export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    // Soft delete - set isActive to false instead of actual deletion
    await rule.update({ isActive: false });

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });

  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rule'
    });
  }
};

// @desc    Toggle rule status (Admin only)
// @route   PATCH /api/rules/:id/toggle
// @access  Private (Admin)
export const toggleRuleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const rule = await Rule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    const newStatus = !rule.isActive;

    // If activating, check for conflicts
    if (newStatus) {
      const existingRule = await Rule.findOne({
        where: { 
          bmiCategory: rule.bmiCategory, 
          bodyFatCategory: rule.bodyFatCategory,
          isActive: true,
          id: { [Op.ne]: id }
        }
      });

      if (existingRule) {
        return res.status(400).json({
          success: false,
          message: 'Cannot activate: Another rule with this combination is already active'
        });
      }
    }

    await rule.update({ isActive: newStatus });

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
      message: `Rule ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: updatedRule
    });

  } catch (error) {
    console.error('Toggle rule status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle rule status'
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

    // Calculate coverage (max 12 combinations: 4 BMI × 3 BodyFat)
    const maxCombinations = 12;
    const coverage = Math.round((activeRules / maxCombinations) * 100);

    res.json({
      success: true,
      data: {
        total: totalRules,
        active: activeRules,
        inactive: totalRules - activeRules,
        coverage: `${coverage}%`,
        maxCombinations,
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

    // Generate all possible combinations
    const bmiCategories = ['B1', 'B2', 'B3', 'B4'];
    const bodyFatCategories = ['L1', 'L2', 'L3'];
    const allCombinations = [];

    bmiCategories.forEach(bmi => {
      bodyFatCategories.forEach(bodyFat => {
        allCombinations.push(`${bmi}-${bodyFat}`);
      });
    });

    // Find missing combinations
    const missingCombinations = allCombinations.filter(combo => 
      !existingCombinations.includes(combo)
    );

    const missingDetails = missingCombinations.map(combo => {
      const [bmi, bodyFat] = combo.split('-');
      return {
        combination: combo,
        bmiCategory: bmi,
        bodyFatCategory: bodyFat,
        bmiDisplay: getBMICategoryDisplay(bmi),
        bodyFatDisplay: getBodyFatCategoryDisplay(bodyFat)
      };
    });

    res.json({
      success: true,
      data: {
        total: allCombinations.length,
        existing: existingCombinations.length,
        missing: missingCombinations.length,
        missingCombinations: missingDetails
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

// @desc    Test forward chaining
// @route   POST /api/rules/test-forward-chaining
// @access  Private (Admin)
export const testForwardChaining = async (req, res) => {
  try {
    const { weight, height, bodyFatPercentage, gender } = req.body;

    if (!weight || !height || !bodyFatPercentage || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All parameters (weight, height, bodyFatPercentage, gender) are required'
      });
    }

    // Calculate BMI
    const bmi = weight / Math.pow(height / 100, 2);

    // Run forward chaining
    const chainResult = await Rule.forwardChaining(bmi, bodyFatPercentage, gender);

    res.json({
      success: true,
      data: {
        input: { weight, height, bodyFatPercentage, gender },
        calculated: { bmi: parseFloat(bmi.toFixed(2)) },
        result: chainResult
      }
    });

  } catch (error) {
    console.error('Test forward chaining error:', error);
    res.status(500).json({
      success: false,
      message: 'Forward chaining test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Bulk create rules
// @route   POST /api/rules/bulk
// @access  Private (Admin)
export const bulkCreateRules = async (req, res) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rules array is required and must not be empty'
      });
    }

    const createdRules = await Rule.bulkCreate(rules, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      success: true,
      message: `${createdRules.length} rules created successfully`,
      data: createdRules
    });

  } catch (error) {
    console.error('Bulk create rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rules'
    });
  }
};

// Helper functions
const getBMICategoryDisplay = (category) => {
  const mapping = {
    'B1': 'Underweight',
    'B2': 'Ideal',
    'B3': 'Overweight',
    'B4': 'Obese'
  };
  return mapping[category] || category;
};

const getBodyFatCategoryDisplay = (category) => {
  const mapping = {
    'L1': 'Rendah',
    'L2': 'Normal',
    'L3': 'Tinggi'
  };
  return mapping[category] || category;
};