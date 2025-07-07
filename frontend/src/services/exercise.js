// frontend/src/services/exercise.js - SIMPLIFIED VERSION
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

  // Create new exercise (admin) - SIMPLIFIED TO 4 FIELDS
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
      
      // SIMPLIFIED DATA - only 4 main fields
      const simplifiedData = {
        name: exerciseData.name,
        category: exerciseData.category,
        description: exerciseData.description || null,
        youtubeUrl: exerciseData.youtubeUrl || null,
        isActive: exerciseData.isActive !== undefined ? exerciseData.isActive : true
      };
      
      const response = await apiService.exercises.create(simplifiedData);
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

  // Update exercise (admin) - SIMPLIFIED TO 4 FIELDS
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
      
      // SIMPLIFIED DATA - only allow 4 main fields to be updated
      const simplifiedData = {};
      if (exerciseData.name !== undefined) simplifiedData.name = exerciseData.name;
      if (exerciseData.category !== undefined) simplifiedData.category = exerciseData.category;
      if (exerciseData.description !== undefined) simplifiedData.description = exerciseData.description;
      if (exerciseData.youtubeUrl !== undefined) simplifiedData.youtubeUrl = exerciseData.youtubeUrl;
      if (exerciseData.isActive !== undefined) simplifiedData.isActive = exerciseData.isActive;
      
      const response = await apiService.exercises.update(id, simplifiedData);
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

  // Toggle exercise status (admin) - FIXED VERSION
  toggleStatus: async (id) => {
    try {
      console.log('🔄 Toggling exercise status for ID:', id);
      
      const response = await apiService.exercises.toggleStatus(id);
      
      console.log('✅ Toggle status response:', response.data);
      
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

  // NEW: Set exercise status directly
  setStatus: async (id, isActive) => {
    try {
      console.log('🔄 Setting exercise status for ID:', id, 'to:', isActive);
      
      const response = await apiService.exercises.updateStatus(id, { isActive });
      
      console.log('✅ Set status response:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Exercise setStatus error:', error);
      const message = error.response?.data?.message || 'Failed to set exercise status';
      return {
        success: false,
        message
      };
    }
  },

  // FIXED: Get all exercises with proper admin/user context
  getAll: async (params = {}) => {
    try {
      console.log('🔄 Exercise service getAll called with params:', params);
      
      // FIXED: Admin context handling
      const requestParams = { ...params };
      
      // If admin wants to see inactive exercises
      if (params.includeInactive === true) {
        requestParams.includeInactive = 'true';
        console.log('👨‍💼 Admin mode: Including inactive exercises with full data');
      } else {
        // Regular user mode - active only
        requestParams.active = true;
        console.log('👤 User mode: Active exercises only');
      }
      
      const response = await apiService.exercises.getAll(requestParams);
      console.log('📥 Exercise API response:', response);
      
      // FIXED: Ensure video data is preserved
      const exercises = response.data.data?.exercises || response.data.exercises || response.data || [];
      
      console.log('🎥 Video data check:', {
        total: exercises.length,
        withVideo: exercises.filter(ex => ex.youtubeUrl).length,
        withVideoId: exercises.filter(ex => ex.youtubeVideoId).length,
        activeCount: exercises.filter(ex => ex.isActive === true).length,
        inactiveCount: exercises.filter(ex => ex.isActive === false).length
      });
      
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

  // Get categories
  getCategories: async () => {
    try {
      const response = await apiService.exercises.getCategories();
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise getCategories error:', error);
      return {
        success: false,
        message: 'Failed to get categories',
        data: []
      };
    }
  },

  // Utility methods - SIMPLIFIED
  utils: {
    // Extract YouTube video ID
    extractVideoId: (url) => {
      return extractVideoId(url);
    },

    // Validate YouTube URL
    validateYouTubeUrl: (url) => {
      return validateYouTubeUrl(url);
    },

    // Process YouTube URL for validation
    processYouTubeUrl: (url) => {
      return processYouTubeUrl(url);
    },

    // Get category display color - SIMPLIFIED TO 3 CATEGORIES
    getCategoryColor: (category) => {
      const colors = {
        'Angkat Beban': 'bg-blue-100 text-blue-800 border-blue-200',
        'Kardio': 'bg-red-100 text-red-800 border-red-200',
        'Other': 'bg-green-100 text-green-800 border-green-200'
      };
      return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    },

    // Process exercise data for display - SIMPLIFIED
    processExerciseData: (exercise) => {
      if (!exercise) return null;
      
      const videoId = exercise.youtubeVideoId || this.extractVideoId(exercise.youtubeUrl);
      
      return {
        ...exercise,
        videoId,
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
        thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
        hasVideo: !!(exercise.youtubeUrl),
        categoryColor: this.getCategoryColor(exercise.category)
      };
    },

    // Validate exercise form data - SIMPLIFIED TO 4 FIELDS
    validateExerciseData: (data) => {
      const errors = [];
      
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Exercise name must be at least 2 characters');
      }
      
      if (!data.category) {
        errors.push('Category is required');
      }
      
      // Validate category - SIMPLIFIED TO 3 OPTIONS
      const validCategories = ['Angkat Beban', 'Kardio', 'Other'];
      if (data.category && !validCategories.includes(data.category)) {
        errors.push('Invalid category. Valid options: Angkat Beban, Kardio, Other');
      }
      
      // YouTube URL validation
      if (data.youtubeUrl) {
        const youtubeResult = processYouTubeUrl(data.youtubeUrl);
        if (!youtubeResult.isValid) {
          errors.push(`YouTube URL: ${youtubeResult.error}`);
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },

    // Get available categories - SIMPLIFIED
    getAvailableCategories: () => {
      return ['Angkat Beban', 'Kardio', 'Other'];
    },

    // Clean exercise data for API - SIMPLIFIED
    cleanExerciseData: (data) => {
      return {
        name: data.name?.trim() || '',
        category: data.category || '',
        description: data.description?.trim() || null,
        youtubeUrl: data.youtubeUrl?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true
      };
    }
  }
};