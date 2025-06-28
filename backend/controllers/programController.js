import { Program, Rule } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// @desc    Get all programs
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
      data: programs
    });

  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get programs'
    });
  }
};

// @desc    Get program by code
// @route   GET /api/programs/:code
// @access  Private
export const getProgramByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const program = await Program.findOne({
      where: { 
        code: code.toUpperCase(),
        isActive: true 
      },
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
    console.error('Get program by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get program'
    });
  }
};

// @desc    Get program by ID
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

// @desc    Create new program (Admin only)
// @route   POST /api/programs
// @access  Private (Admin)
export const createProgram = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      bmiCategory,
      bodyFatCategory,
      cardioRatio,
      dietRecommendation,
      schedule
    } = req.body;

    // Check if program code already exists
    const existingProgram = await Program.findOne({ where: { code } });
    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: 'Program code already exists'
      });
    }

    // Check if combination already exists
    const existingCombination = await Program.findOne({
      where: { bmiCategory, bodyFatCategory }
    });
    if (existingCombination) {
      return res.status(400).json({
        success: false,
        message: 'BMI and Body Fat category combination already exists'
      });
    }

    const program = await Program.create({
      code: code.toUpperCase(),
      name,
      description,
      bmiCategory,
      bodyFatCategory,
      cardioRatio,
      dietRecommendation,
      schedule
    });

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program
    });

  } catch (error) {
    console.error('Create program error:', error);
    
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
      message: 'Failed to create program'
    });
  }
};

// @desc    Update program (Admin only)
// @route   PUT /api/programs/:id
// @access  Private (Admin)
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const program = await Program.findByPk(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // If updating code, check uniqueness
    if (updateData.code && updateData.code !== program.code) {
      const existingProgram = await Program.findOne({
        where: { 
          code: updateData.code.toUpperCase(),
          id: { [Op.ne]: id }
        }
      });
      if (existingProgram) {
        return res.status(400).json({
          success: false,
          message: 'Program code already exists'
        });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // If updating BMI/Body Fat categories, check combination uniqueness
    if (updateData.bmiCategory || updateData.bodyFatCategory) {
      const bmiCategory = updateData.bmiCategory || program.bmiCategory;
      const bodyFatCategory = updateData.bodyFatCategory || program.bodyFatCategory;
      
      const existingCombination = await Program.findOne({
        where: { 
          bmiCategory, 
          bodyFatCategory,
          id: { [Op.ne]: id }
        }
      });
      if (existingCombination) {
        return res.status(400).json({
          success: false,
          message: 'BMI and Body Fat category combination already exists'
        });
      }
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
      message: 'Program updated successfully',
      data: updatedProgram
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

// @desc    Delete program (Admin only)
// @route   DELETE /api/programs/:id
// @access  Private (Admin)
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await Program.findByPk(id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Soft delete - set isActive to false instead of actual deletion
    await program.update({ isActive: false });

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });

  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete program'
    });
  }
};

// @desc    Get program statistics
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

    res.json({
      success: true,
      data: {
        total: totalPrograms,
        active: activePrograms,
        inactive: totalPrograms - activePrograms,
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