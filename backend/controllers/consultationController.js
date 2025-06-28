import { Consultation, User, Program, Rule } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Create new consultation with forward chaining
// @route   POST /api/consultations
// @access  Private
export const createConsultation = async (req, res) => {
  try {
    const { weight, height, bodyFatPercentage, notes } = req.body;
    const userId = req.user.id;

    // Validation
    if (!weight || !height || !bodyFatPercentage) {
      return res.status(400).json({
        success: false,
        message: 'Weight, height, and body fat percentage are required'
      });
    }

    // Create consultation using forward chaining
    const consultation = await Consultation.createWithForwardChaining({
      userId,
      weight: parseFloat(weight),
      height: parseFloat(height),
      bodyFatPercentage: parseFloat(bodyFatPercentage),
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: consultation
    });

  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create consultation'
    });
  }
};

// @desc    Get user's consultations
// @route   GET /api/consultations
// @access  Private
export const getUserConsultations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    
    const result = await Consultation.findByUser(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });

    res.json({
      success: true,
      data: {
        consultations: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations'
    });
  }
};

// @desc    Get specific consultation
// @route   GET /api/consultations/:id
// @access  Private
export const getConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findOne({
      where: { id, userId },
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

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    res.json({
      success: true,
      data: consultation
    });

  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation'
    });
  }
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id
// @access  Private
export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const consultation = await Consultation.findOne({
      where: { id, userId }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await consultation.update(updateData);

    // Fetch updated consultation with associations
    const updatedConsultation = await Consultation.findOne({
      where: { id },
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

    res.json({
      success: true,
      message: 'Consultation updated successfully',
      data: updatedConsultation
    });

  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation'
    });
  }
};

// @desc    Delete consultation
// @route   DELETE /api/consultations/:id
// @access  Private
export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const consultation = await Consultation.findOne({
      where: { id, userId }
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }

    await consultation.destroy();

    res.json({
      success: true,
      message: 'Consultation deleted successfully'
    });

  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete consultation'
    });
  }
};

// @desc    Get all consultations (Admin only)
// @route   GET /api/consultations/admin
// @access  Private (Admin)
export const getAllConsultations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;

    let userWhereClause = {};
    if (search) {
      userWhereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const result = await Consultation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'gender'],
          where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined,
          required: Object.keys(userWhereClause).length > 0
        },
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
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        consultations: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations'
    });
  }
};

// @desc    Get consultation statistics
// @route   GET /api/consultations/stats
// @access  Private (Admin)
export const getConsultationStats = async (req, res) => {
  try {
    // Basic stats without complex queries
    const total = await Consultation.count();
    
    // Today's consultations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await Consultation.count({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentConsultations = await Consultation.findAll({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: ['userId'],
      group: ['userId']
    });
    
    const activeUsers = recentConsultations.length;

    // Program statistics
    const consultationsWithPrograms = await Consultation.findAll({
      include: [{
        model: Program,
        as: 'program',
        attributes: ['code', 'name']
      }]
    });

    // Count programs manually
    const programCounts = {};
    consultationsWithPrograms.forEach(consultation => {
      if (consultation.program) {
        const code = consultation.program.code;
        if (!programCounts[code]) {
          programCounts[code] = {
            program: {
              code: consultation.program.code,
              name: consultation.program.name
            },
            count: 0
          };
        }
        programCounts[code].count++;
      }
    });

    const programStats = Object.values(programCounts)
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        activeUsers,
        programStats
      }
    });

  } catch (error) {
    console.error('Get consultation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};