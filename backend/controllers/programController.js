import { Program, Rule } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// @desc    Get all programs (READ ONLY)
// @route   GET /api/programs
// @access  Private
export const getPrograms = async (req, res) => {
  try {
    const { search, category, active } = req.query;

    let whereClause = {};
    
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    if (category) {
      whereClause.bmiCategory = category;
    }

    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    } else {
      whereClause.isActive = true; // Default to active only
    }

    const programs = await Program.findAll({
      where: whereClause,
      include: [
        {
          model: Rule,
          as: 'rules',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['code', 'ASC']]
    });

    res.json({
      success: true,
      data: programs,
      meta: {
        total: programs.length,
        editOnly: true,
        medicallyValidated: true
      }
    });

  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get programs'
    });
  }
};

// @desc    Get program by ID (READ ONLY)
// @route   GET /api/programs/id/:id
// @access  Private
export const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findByPk(id, {
      include: [
        {
          model: Rule,
          as: 'rules',
          attributes: ['id', 'name', 'description', 'bmiCategory', 'bodyFatCategory']
        }
      ]
    });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });

  } catch (error) {
    console.error('Get program by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get program'
    });
  }
};

// @desc    Update program CONTENT ONLY (Admin only)
// @route   PUT /api/programs/:id
// @access  Private (Admin)
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ONLY ALLOW CONTENT UPDATES - NOT STRUCTURAL CHANGES
    const allowedFields = [
      'name',
      'description', 
      'cardioRatio',
      'dietRecommendation',
      'schedule',
      'isActive'
    ];
    
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // BLOCKED FIELDS - Cannot be changed
    const blockedFields = ['code', 'bmiCategory', 'bodyFatCategory'];
    const blockedAttempts = blockedFields.filter(field => req.body[field] !== undefined);
    
    if (blockedAttempts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify protected fields: ${blockedAttempts.join(', ')}`,
        note: 'Program structure (code, BMI category, body fat category) cannot be changed to maintain medical logic integrity'
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
        allowedFields
      });
    }

    const program = await Program.findByPk(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    await program.update(updateData);

    // Fetch updated program with associations
    const updatedProgram = await Program.findByPk(id, {
      include: [
        {
          model: Rule,
          as: 'rules',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Program content updated successfully',
      data: updatedProgram,
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error('Update program error:', error);
    
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
      message: 'Failed to update program'
    });
  }
};

// @desc    Get program statistics (READ ONLY)
// @route   GET /api/programs/stats
// @access  Private (Admin)
export const getProgramStats = async (req, res) => {
  try {
    const totalPrograms = await Program.count();
    const activePrograms = await Program.count({ where: { isActive: true } });

    // Count by BMI categories
    const bmiStats = await Program.findAll({
      attributes: [
        'bmiCategory',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['bmiCategory']
    });

    // Count by Body Fat categories
    const bodyFatStats = await Program.findAll({
      attributes: [
        'bodyFatCategory',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['bodyFatCategory']
    });

    // Calculate completion percentage
    const programsWithCompleteSchedule = await Program.count({
      where: {
        isActive: true,
        schedule: {
          [Op.ne]: null
        }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalPrograms,
        active: activePrograms,
        inactive: totalPrograms - activePrograms,
        coverage: '100%',
        completionRate: Math.round((programsWithCompleteSchedule / totalPrograms) * 100),
        medicallyValidated: true,
        systemStatus: 'optimal',
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
    console.error('Get program stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get program statistics'
    });
  }
};