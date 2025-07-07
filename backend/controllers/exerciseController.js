// backend/controllers/exerciseController.js - SIMPLIFIED VERSION
import { Exercise } from '../models/index.js';
import { Op } from 'sequelize';
import { validateYouTubeUrl, extractVideoId, getVideoInfo } from '../utils/youtubeHelper.js';

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
export const getExercises = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10, includeInactive } = req.query;
    
    let whereClause = {};
    
    // FIXED: Admin can see inactive exercises with all data including videos
    if (includeInactive !== 'true') {
      whereClause.isActive = true;  // Only for regular users
    }
    // For admin (includeInactive = true), no isActive filter = show all
    
    console.log('🔍 Exercise query:', { 
      includeInactive, 
      isAdmin: includeInactive === 'true',
      whereClause 
    });
    
    // Search filter
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    // Category filter - SIMPLIFIED (only 3 categories)
    if (category && category !== 'All') {
      whereClause.category = category;
    }
    
    const offset = (page - 1) * limit;
    
    const result = await Exercise.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['category', 'ASC'], ['name', 'ASC']],
      // FIXED: Always include all fields including video data
      attributes: [
        'id', 'name', 'category', 'description', 
        'youtubeUrl', 'youtubeVideoId', 'isActive', 
        'createdAt', 'updatedAt'
      ]
    });

    console.log(`📊 Found ${result.count} exercises, showing ${result.rows.length}`);
    console.log(`🎥 Exercises with video: ${result.rows.filter(ex => ex.youtubeUrl).length}`);
    console.log(`✅ Active: ${result.rows.filter(ex => ex.isActive === true).length}`);
    console.log(`❌ Inactive: ${result.rows.filter(ex => ex.isActive === false).length}`);

    res.json({
      success: true,
      data: {
        exercises: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercises'
    });
  }
};

// @desc    Get exercises by category
// @route   GET /api/exercises/category/:category
// @access  Public
export const getExercisesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category - SIMPLIFIED
    const validCategories = ['Angkat Beban', 'Kardio', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Valid categories: Angkat Beban, Kardio, Other'
      });
    }
    
    const exercises = await Exercise.findAll({
      where: {
        category,
        isActive: true
      },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: exercises
    });

  } catch (error) {
    console.error('Get exercises by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercises by category'
    });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Public
export const getExercise = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.json({
      success: true,
      data: exercise
    });

  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise'
    });
  }
};

// @desc    Create exercise - SIMPLIFIED VALIDATION
// @route   POST /api/exercises
// @access  Private (Admin)
export const createExercise = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      youtubeUrl
    } = req.body;

    // SIMPLIFIED validation - only 4 fields
    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Nama gerakan harus diisi dan minimal 2 karakter');
    }
    
    if (!category) {
      errors.push('Kategori harus dipilih');
    }
    
    // Validate category - SIMPLIFIED
    const validCategories = ['Angkat Beban', 'Kardio', 'Other'];
    if (category && !validCategories.includes(category)) {
      errors.push('Kategori tidak valid. Pilihan: Angkat Beban, Kardio, Other');
    }

    // Validate YouTube URL if provided
    if (youtubeUrl) {
      const isValidUrl = validateYouTubeUrl(youtubeUrl);
      if (!isValidUrl) {
        errors.push('Format URL YouTube tidak valid');
      } else {
        // Try to extract video ID
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
          errors.push('Tidak dapat mengekstrak video ID dari URL YouTube');
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.map(err => ({ message: err }))
      });
    }

    const exercise = await Exercise.create({
      name: name.trim(),
      category,
      description: description?.trim() || null,
      youtubeUrl: youtubeUrl?.trim() || null,
      isActive: true,
      createdBy: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise
    });

  } catch (error) {
    console.error('Create exercise error:', error);
    
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
      message: 'Failed to create exercise'
    });
  }
};

// @desc    Update exercise - SIMPLIFIED VALIDATION
// @route   PUT /api/exercises/:id
// @access  Private (Admin)
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, youtubeUrl, isActive } = req.body;

    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // SIMPLIFIED validation for updates
    const errors = [];
    
    if (name !== undefined && (!name || name.trim().length < 2)) {
      errors.push('Nama gerakan harus diisi dan minimal 2 karakter');
    }
    
    if (category !== undefined) {
      const validCategories = ['Angkat Beban', 'Kardio', 'Other'];
      if (!validCategories.includes(category)) {
        errors.push('Kategori tidak valid. Pilihan: Angkat Beban, Kardio, Other');
      }
    }

    // Validate YouTube URL if being updated
    if (youtubeUrl !== undefined && youtubeUrl) {
      const isValidUrl = validateYouTubeUrl(youtubeUrl);
      if (!isValidUrl) {
        errors.push('Format URL YouTube tidak valid');
      } else {
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
          errors.push('Tidak dapat mengekstrak video ID dari URL YouTube');
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.map(err => ({ message: err }))
      });
    }

    // Prepare update data - SIMPLIFIED
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    await exercise.update(updateData);

    // Fetch updated exercise
    const updatedExercise = await Exercise.findByPk(id);

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: updatedExercise
    });

  } catch (error) {
    console.error('Update exercise error:', error);
    
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
      message: 'Failed to update exercise'
    });
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private (Admin)
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    await exercise.destroy();

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });

  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exercise'
    });
  }
};

export const toggleExerciseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Toggling exercise status for ID: ${id}`);
    
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      console.log(`❌ Exercise not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    console.log(`📊 Current status: ${exercise.isActive} → ${!exercise.isActive}`);

    // FIXED: Explicitly toggle the boolean value
    const newStatus = !exercise.isActive;
    
    await exercise.update({
      isActive: newStatus
    });

    // FIXED: Refresh the exercise data to ensure updated values
    await exercise.reload();

    console.log(`✅ Exercise status updated: ${exercise.name} is now ${exercise.isActive ? 'ACTIVE' : 'INACTIVE'}`);

    res.json({
      success: true,
      message: `Exercise ${exercise.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: exercise.id,
        name: exercise.name,
        isActive: exercise.isActive,
        category: exercise.category
      }
    });

  } catch (error) {
    console.error('❌ Toggle exercise status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle exercise status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update exercise status directly - NEW ENDPOINT
// @route   PATCH /api/exercises/:id/status
// @access  Private (Admin)
export const updateExerciseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log(`🔄 Setting exercise status for ID: ${id} to ${isActive}`);
    
    // Validate isActive parameter
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }
    
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    await exercise.update({ isActive });
    await exercise.reload();

    console.log(`✅ Exercise status set: ${exercise.name} is now ${exercise.isActive ? 'ACTIVE' : 'INACTIVE'}`);

    res.json({
      success: true,
      message: `Exercise ${exercise.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: exercise.id,
        name: exercise.name,
        isActive: exercise.isActive,
        category: exercise.category
      }
    });

  } catch (error) {
    console.error('❌ Update exercise status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exercise status'
    });
  }
};

// @desc    Get exercise statistics - FIXED ACTIVE/INACTIVE COUNT
// @route   GET /api/exercises/admin/stats
// @access  Private (Admin)
export const getExerciseStats = async (req, res) => {
  try {
    const totalExercises = await Exercise.count();
    
    // FIXED: Explicit boolean comparison for active/inactive count
    const activeExercises = await Exercise.count({ 
      where: { 
        isActive: true  // Explicitly check for true
      } 
    });
    
    const inactiveExercises = await Exercise.count({ 
      where: { 
        isActive: false  // Explicitly check for false
      } 
    });
    
    const withVideo = await Exercise.count({ 
      where: { 
        youtubeUrl: { [Op.ne]: null },
        isActive: true 
      } 
    });

    // Count by category - FIXED with explicit active filter
    const categoryStats = await Exercise.findAll({
      attributes: [
        'category',
        [Exercise.sequelize.fn('COUNT', Exercise.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },  // Only count active exercises
      group: ['category'],
      order: [[Exercise.sequelize.literal('count'), 'DESC']]
    });

    // FIXED: Get status breakdown
    const statusBreakdown = {
      total: totalExercises,
      active: activeExercises,
      inactive: inactiveExercises,
      activePercentage: totalExercises > 0 ? Math.round((activeExercises / totalExercises) * 100) : 0,
      inactivePercentage: totalExercises > 0 ? Math.round((inactiveExercises / totalExercises) * 100) : 0
    };

    console.log('📊 Exercise stats:', statusBreakdown);

    res.json({
      success: true,
      data: {
        total: totalExercises,
        active: activeExercises,
        inactive: inactiveExercises,
        withVideo: withVideo,
        withoutVideo: activeExercises - withVideo,
        videoPercentage: activeExercises > 0 ? Math.round((withVideo / activeExercises) * 100) : 0,
        statusBreakdown,
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          count: parseInt(stat.get('count'))
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get exercise stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise statistics'
    });
  }
};

// @desc    Get available categories - SIMPLIFIED
// @route   GET /api/exercises/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = ['Angkat Beban', 'Kardio', 'Other'];
    
    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Exercise.count({
          where: {
            category,
            isActive: true
          }
        });
        
        return {
          name: category,
          count,
          color: Exercise.getCategoryColor(category)
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
};