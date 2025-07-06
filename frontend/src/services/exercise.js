// frontend/src/services/exercise.js - UPDATED WITH ROBUST YOUTUBE HANDLING
import { apiService } from './api';
import { extractVideoId, validateYouTubeUrl, processYouTubeUrl } from '../utils/youtubeHelper';

export const exerciseService = {
  // Get all exercises with filtering and pagination
  getAll: async (params = {}) => {
    try {
      console.log('🔄 Exercise service getAll called with params:', params);
      const response = await apiService.exercises.getAll(params);
      console.log('📥 Exercise API response:', response);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise getAll error:', error);
      const message = error.response?.data?.message || 'Failed to get exercises';
      return {
        success: false,
        message,
        data: { 
          exercises: [], 
          pagination: { 
            total: 0, 
            page: 1, 
            totalPages: 0,
            limit: params.limit || 10
          } 
        }
      };
    }
  },

  // Get exercises by category
  getByCategory: async (category) => {
    try {
      console.log('🔄 Getting exercises by category:', category);
      const response = await apiService.exercises.getByCategory(category);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise getByCategory error:', error);
      const message = error.response?.data?.message || 'Failed to get exercises by category';
      return {
        success: false,
        message,
        data: []
      };
    }
  },

  // Get single exercise
  getById: async (id) => {
    try {
      const response = await apiService.exercises.getById(id);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise getById error:', error);
      const message = error.response?.data?.message || 'Failed to get exercise';
      return {
        success: false,
        message
      };
    }
  },

  // Create new exercise (admin) - ENHANCED YOUTUBE VALIDATION
  create: async (exerciseData) => {
    try {
      console.log('🔄 Creating exercise:', exerciseData);
      
      // Process YouTube URL if provided
      if (exerciseData.youtubeUrl) {
        const youtubeResult = processYouTubeUrl(exerciseData.youtubeUrl);
        
        if (!youtubeResult.isValid) {
          console.error('❌ YouTube URL validation failed:', youtubeResult.error);
          return {
            success: false,
            message: youtubeResult.error,
            errors: [{ field: 'youtubeUrl', message: youtubeResult.error }]
          };
        }
        
        // Use normalized URL and add video ID
        exerciseData.youtubeUrl = youtubeResult.normalizedUrl;
        exerciseData.youtubeVideoId = youtubeResult.videoId;
        
        console.log('✅ YouTube URL processed:', {
          original: exerciseData.youtubeUrl,
          normalized: youtubeResult.normalizedUrl,
          videoId: youtubeResult.videoId
        });
      }
      
      const response = await apiService.exercises.create(exerciseData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Exercise create error:', error);
      const message = error.response?.data?.message || 'Failed to create exercise';
      const errors = error.response?.data?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  },

  // Update exercise (admin) - ENHANCED YOUTUBE VALIDATION
  update: async (id, exerciseData) => {
    try {
      console.log('🔄 Updating exercise:', id, exerciseData);
      
      // Process YouTube URL if provided
      if (exerciseData.youtubeUrl) {
        const youtubeResult = processYouTubeUrl(exerciseData.youtubeUrl);
        
        if (!youtubeResult.isValid) {
          console.error('❌ YouTube URL validation failed:', youtubeResult.error);
          return {
            success: false,
            message: youtubeResult.error,
            errors: [{ field: 'youtubeUrl', message: youtubeResult.error }]
          };
        }
        
        // Use normalized URL and add video ID
        exerciseData.youtubeUrl = youtubeResult.normalizedUrl;
        exerciseData.youtubeVideoId = youtubeResult.videoId;
        
        console.log('✅ YouTube URL processed for update:', {
          original: exerciseData.youtubeUrl,
          normalized: youtubeResult.normalizedUrl,
          videoId: youtubeResult.videoId
        });
      }
      
      const response = await apiService.exercises.update(id, exerciseData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Exercise update error:', error);
      const message = error.response?.data?.message || 'Failed to update exercise';
      const errors = error.response?.data?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  },

  // Delete exercise (admin)
  delete: async (id) => {
    try {
      console.log('🔄 Deleting exercise:', id);
      const response = await apiService.exercises.delete(id);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Exercise delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete exercise';
      return {
        success: false,
        message
      };
    }
  },

  // Toggle exercise status (admin)
  toggleStatus: async (id) => {
    try {
      const response = await apiService.exercises.toggleStatus(id);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Exercise toggleStatus error:', error);
      const message = error.response?.data?.message || 'Failed to toggle exercise status';
      return {
        success: false,
        message
      };
    }
  },

  // Get exercise statistics (admin)
  getStats: async () => {
    try {
      const response = await apiService.exercises.getStats();
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise getStats error:', error);
      const message = error.response?.data?.message || 'Failed to get exercise statistics';
      return {
        success: false,
        message,
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          withVideo: 0,
          withoutVideo: 0,
          videoPercentage: 0,
          categoryStats: [],
          difficultyStats: []
        }
      };
    }
  },

  // Utility methods - ENHANCED WITH ROBUST YOUTUBE HANDLING
  utils: {
    // Extract YouTube video ID - USE ROBUST VERSION
    extractVideoId: (url) => {
      return extractVideoId(url);
    },

    // Validate YouTube URL - USE ROBUST VERSION
    validateYouTubeUrl: (url) => {
      return validateYouTubeUrl(url);
    },

    // Process YouTube URL for validation
    processYouTubeUrl: (url) => {
      return processYouTubeUrl(url);
    },

    // Get category display color
    getCategoryColor: (category) => {
      const colors = {
        'Push': 'bg-red-100 text-red-800 border-red-200',
        'Pull': 'bg-blue-100 text-blue-800 border-blue-200',
        'Leg': 'bg-green-100 text-green-800 border-green-200',
        'Full Body': 'bg-purple-100 text-purple-800 border-purple-200',
        'Cardio': 'bg-orange-100 text-orange-800 border-orange-200'
      };
      return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    },

    // Get difficulty display color
    getDifficultyColor: (difficulty) => {
      const colors = {
        'Beginner': 'bg-green-100 text-green-800',
        'Intermediate': 'bg-yellow-100 text-yellow-800',
        'Advanced': 'bg-red-100 text-red-800'
      };
      return colors[difficulty] || 'bg-gray-100 text-gray-800';
    },

    // Process exercise data for display
    processExerciseData: (exercise) => {
      if (!exercise) return null;
      
      const videoId = exercise.youtubeVideoId || this.extractVideoId(exercise.youtubeUrl);
      
      return {
        ...exercise,
        videoId,
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
        thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
        hasVideo: !!(exercise.youtubeUrl || exercise.videoUrl),
        categoryColor: this.getCategoryColor(exercise.category),
        difficultyColor: this.getDifficultyColor(exercise.difficulty)
      };
    },

    // Validate exercise form data - ENHANCED YOUTUBE VALIDATION
    validateExerciseData: (data) => {
      const errors = [];
      
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Exercise name must be at least 2 characters');
      }
      
      if (!data.category) {
        errors.push('Category is required');
      }
      
      // Enhanced YouTube URL validation
      if (data.youtubeUrl) {
        const youtubeResult = processYouTubeUrl(data.youtubeUrl);
        if (!youtubeResult.isValid) {
          errors.push(`YouTube URL: ${youtubeResult.error}`);
        }
      }
      
      if (data.muscleGroups && !Array.isArray(data.muscleGroups)) {
        errors.push('Muscle groups must be an array');
      }
      
      if (data.equipment && !Array.isArray(data.equipment)) {
        errors.push('Equipment must be an array');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  }
};