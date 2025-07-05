// backend/controllers/exerciseController.js - FIXED VERSION
import { Exercise } from '../models/index.js';
import { Op } from 'sequelize';
import { validateYouTubeUrl, extractVideoId, getVideoInfo } from '../utils/youtubeHelper.js';

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
export const getExercises = async (req, res) => {
  try {
    const { search, category, difficulty, page = 1, limit = 10 } = req.query;
    
    let whereClause = { isActive: true };
    
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
    
    // Category filter
    if (category) {
      whereClause.category = category;
    }
    
    // Difficulty filter
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }
    
    const offset = (page - 1) * limit;
    
    const result = await Exercise.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

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

// @desc    Create exercise
// @route   POST /api/exercises
// @access  Private (Admin)
export const createExercise = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      instructions,
      sets,
      duration,
      difficulty,
      youtubeUrl,
      muscleGroups,
      equipment,
      tags
    } = req.body;

    // Validate YouTube URL if provided
    if (youtubeUrl) {
      const isValidUrl = validateYouTubeUrl(youtubeUrl);
      if (!isValidUrl) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL format'
        });
      }

      // Try to get video info to verify URL works
      try {
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
          return res.status(400).json({
            success: false,
            message: 'Could not extract video ID from YouTube URL'
          });
        }

        // Optional: Try to get video info
        const videoInfo = await getVideoInfo(videoId);
        if (!videoInfo) {
          console.warn('YouTube video validation warning: Could not verify video availability');
          // Continue with creation but log warning
        }
      } catch (error) {
        console.warn('YouTube video validation warning:', error.message);
        // Continue with creation but log warning
      }
    }

    const exercise = await Exercise.create({
      name,
      category,
      description,
      instructions,
      sets,
      duration,
      difficulty: difficulty || 'Beginner',
      youtubeUrl,
      muscleGroups: muscleGroups || [],
      equipment: equipment || [],
      tags: tags || [],
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

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private (Admin)
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Validate YouTube URL if being updated
    if (updateData.youtubeUrl) {
      const isValidUrl = validateYouTubeUrl(updateData.youtubeUrl);
      if (!isValidUrl) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL format'
        });
      }

      // Try to get video info to verify URL works
      try {
        const videoId = extractVideoId(updateData.youtubeUrl);
        if (!videoId) {
          return res.status(400).json({
            success: false,
            message: 'Could not extract video ID from YouTube URL'
          });
        }

        // Optional: Try to get video info
        const videoInfo = await getVideoInfo(videoId);
        if (!videoInfo) {
          console.warn('YouTube video validation warning: Could not verify video availability');
          // Continue with update but log warning
        }
      } catch (error) {
        console.warn('YouTube video validation warning:', error.message);
        // Continue with update but log warning
      }
    }

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

// @desc    Toggle exercise status
// @route   PATCH /api/exercises/:id/toggle
// @access  Private (Admin)
export const toggleExerciseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    await exercise.update({
      isActive: !exercise.isActive
    });

    res.json({
      success: true,
      message: `Exercise ${exercise.isActive ? 'activated' : 'deactivated'} successfully`,
      data: exercise
    });

  } catch (error) {
    console.error('Toggle exercise status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle exercise status'
    });
  }
};

// @desc    Get exercise statistics
// @route   GET /api/exercises/admin/stats
// @access  Private (Admin)
export const getExerciseStats = async (req, res) => {
  try {
    const totalExercises = await Exercise.count();
    const activeExercises = await Exercise.count({ where: { isActive: true } });
    const withVideo = await Exercise.count({ 
      where: { 
        youtubeUrl: { [Op.ne]: null },
        isActive: true 
      } 
    });

    // Count by category
    const categoryStats = await Exercise.findAll({
      attributes: [
        'category',
        [Exercise.sequelize.fn('COUNT', Exercise.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['category'],
      order: [[Exercise.sequelize.literal('count'), 'DESC']]
    });

    // Count by difficulty
    const difficultyStats = await Exercise.findAll({
      attributes: [
        'difficulty',
        [Exercise.sequelize.fn('COUNT', Exercise.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['difficulty']
    });

    res.json({
      success: true,
      data: {
        total: totalExercises,
        active: activeExercises,
        inactive: totalExercises - activeExercises,
        withVideo: withVideo,
        withoutVideo: activeExercises - withVideo,
        videoPercentage: activeExercises > 0 ? Math.round((withVideo / activeExercises) * 100) : 0,
        categoryStats: categoryStats.map(stat => ({
          category: stat.category,
          count: parseInt(stat.get('count'))
        })),
        difficultyStats: difficultyStats.map(stat => ({
          difficulty: stat.difficulty,
          count: parseInt(stat.get('count'))
        }))
      }
    });

  } catch (error) {
    console.error('Get exercise stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise statistics'
    });
  }
};

// @desc    Get available categories
// @route   GET /api/exercises/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = ['Push', 'Pull', 'Leg', 'Full Body', 'Cardio'];
    
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