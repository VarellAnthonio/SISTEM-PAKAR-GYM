// frontend/src/services/exercise.js - COMPLETE VERSION
import { apiService } from './api';

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
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
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

  // Get available categories
  getCategories: async () => {
    try {
      const response = await apiService.exercises.getCategories();
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise getCategories error:', error);
      const message = error.response?.data?.message || 'Failed to get categories';
      return {
        success: false,
        message,
        data: [
          { name: 'Push', count: 0, color: 'bg-red-100 text-red-800' },
          { name: 'Pull', count: 0, color: 'bg-blue-100 text-blue-800' },
          { name: 'Leg', count: 0, color: 'bg-green-100 text-green-800' },
          { name: 'Full Body', count: 0, color: 'bg-purple-100 text-purple-800' },
          { name: 'Cardio', count: 0, color: 'bg-orange-100 text-orange-800' }
        ]
      };
    }
  },

  // Search exercises
  search: async (searchTerm, filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await apiService.exercises.search(params);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Exercise search error:', error);
      const message = error.response?.data?.message || 'Failed to search exercises';
      return {
        success: false,
        message
      };
    }
  },

  // Create new exercise (admin)
  create: async (exerciseData) => {
    try {
      console.log('🔄 Creating exercise:', exerciseData);
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

  // Update exercise (admin)
  update: async (id, exerciseData) => {
    try {
      console.log('🔄 Updating exercise:', id, exerciseData);
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

  // Admin methods
  admin: {
    // Get exercise statistics
    getStats: async () => {
      try {
        const response = await apiService.exercises.admin.getStats();
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to get exercise statistics';
        return {
          success: false,
          message
        };
      }
    },

    // Create new exercise
    create: async (exerciseData) => {
      try {
        const response = await apiService.exercises.admin.create(exerciseData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create exercise';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Update exercise
    update: async (id, exerciseData) => {
      try {
        const response = await apiService.exercises.admin.update(id, exerciseData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update exercise';
        const errors = error.response?.data?.errors || [];
        return {
          success: false,
          message,
          errors
        };
      }
    },

    // Delete exercise
    delete: async (id) => {
      try {
        const response = await apiService.exercises.admin.delete(id);
        return {
          success: true,
          message: response.data.message
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete exercise';
        return {
          success: false,
          message
        };
      }
    },

    // Validate YouTube URL
    validateYouTube: async (url) => {
      try {
        const response = await apiService.exercises.admin.validateYouTube(url);
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to validate YouTube URL';
        return {
          success: false,
          message
        };
      }
    }
  },

  // Utility methods - WORKING VERSION
  utils: {
    // Extract YouTube video ID from URL - ROBUST VERSION
    extractVideoId: (url) => {
      if (!url || typeof url !== 'string') {
        console.warn('Invalid YouTube URL provided:', url);
        return null;
      }
      
      try {
        // Multiple YouTube URL patterns
        const patterns = [
          // Standard watch URL
          /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
          // Short URL
          /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
          // Embed URL
          /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
          // V URL
          /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
          // Watch URL with additional parameters
          /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            console.log('✅ Video ID extracted:', match[1], 'from URL:', url);
            return match[1];
          }
        }
        
        console.warn('❌ Could not extract video ID from URL:', url);
        return null;
      } catch (error) {
        console.error('❌ Error extracting video ID:', error);
        return null;
      }
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

    // Generate YouTube embed URL
    generateEmbedUrl: (videoId, options = {}) => {
      if (!videoId) return null;
      
      const defaultOptions = {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      };
      
      const embedOptions = { ...defaultOptions, ...options };
      const params = new URLSearchParams(embedOptions);
      
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    },

    // Generate YouTube thumbnail URL
    generateThumbnailUrl: (videoId, quality = 'hqdefault') => {
      if (!videoId) return null;
      const validQualities = ['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'];
      const thumbnailQuality = validQualities.includes(quality) ? quality : 'hqdefault';
      return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
    },

    // Validate YouTube URL
    validateYouTubeUrl: (url) => {
      if (!url) return false;
      return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
    },

    // Process exercise data for display
    processExerciseData: (exercise) => {
      if (!exercise) return null;
      
      const videoId = exercise.youtubeVideoId || this.extractVideoId(exercise.youtubeUrl);
      
      return {
        ...exercise,
        videoId,
        embedUrl: videoId ? this.generateEmbedUrl(videoId) : null,
        thumbnailUrl: videoId ? this.generateThumbnailUrl(videoId) : null,
        hasVideo: !!(exercise.youtubeUrl || exercise.videoUrl),
        categoryColor: this.getCategoryColor(exercise.category),
        difficultyColor: this.getDifficultyColor(exercise.difficulty)
      };
    },

    // Filter exercises by multiple criteria
    filterExercises: (exercises, filters) => {
      return exercises.filter(exercise => {
        // Category filter
        if (filters.category && filters.category !== 'All' && exercise.category !== filters.category) {
          return false;
        }
        
        // Difficulty filter
        if (filters.difficulty && filters.difficulty !== 'All' && exercise.difficulty !== filters.difficulty) {
          return false;
        }
        
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchFields = [
            exercise.name,
            exercise.description,
            exercise.muscleGroups?.join(' '),
            exercise.equipment?.join(' ')
          ].join(' ').toLowerCase();
          
          if (!searchFields.includes(searchTerm)) {
            return false;
          }
        }
        
        // Has video filter
        if (filters.hasVideo !== undefined) {
          const hasVideo = !!(exercise.youtubeUrl || exercise.videoUrl);
          if (filters.hasVideo !== hasVideo) {
            return false;
          }
        }
        
        return true;
      });
    },

    // Get exercise statistics from array
    getExerciseStats: (exercises) => {
      const stats = {
        total: exercises.length,
        withVideo: 0,
        withoutVideo: 0,
        byCategory: {},
        byDifficulty: {}
      };
      
      exercises.forEach(exercise => {
        // Video stats
        if (exercise.youtubeUrl || exercise.videoUrl) {
          stats.withVideo++;
        } else {
          stats.withoutVideo++;
        }
        
        // Category stats
        const category = exercise.category || 'Unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        // Difficulty stats
        const difficulty = exercise.difficulty || 'Unknown';
        stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
      });
      
      return stats;
    },

    // Validate exercise form data
    validateExerciseData: (data) => {
      const errors = [];
      
      if (!data.name || data.name.trim().length < 2) {
        errors.push('Exercise name must be at least 2 characters');
      }
      
      if (!data.category) {
        errors.push('Category is required');
      }
      
      if (data.youtubeUrl && !this.validateYouTubeUrl(data.youtubeUrl)) {
        errors.push('Invalid YouTube URL format');
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